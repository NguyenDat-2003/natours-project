const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');

const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(
            new AppError('Not an image! Please upload only images.', 400),
            false
        );
    }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
const uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 },
]);

// upload.single('image') req.file
// upload.array('images', 5) req.files

const resizeTourImages = async (req, res, next) => {
    // console.log(req.files);
    if (!req.files.imageCover || !req.files.images) return next();
    // 1) ImageCover
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
        //--Hình ảnh tỉ lệ 2:3
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);

    // 2) Images
    req.body.images = [];
    await Promise.all(
        req.files.images.map(async (file, index) => {
            const fileName = `tour-${req.params.id}-${Date.now()}-${
                index + 1
            }-cover.jpeg`;
            await sharp(file.buffer)
                //--Hình ảnh tỉ lệ 2:3
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${fileName}`);

            req.body.images.push(fileName);
        })
    );
    next();
};

const aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

const setTourId = (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    next();
};

const createTour = factory.createOne(Tour);

const getAllTours = factory.getAll(Tour);

const getTour = factory.getOne(Tour, { path: 'reviews' });

const updateTour = factory.updateOne(Tour);

const deleteTour = factory.deleteOne(Tour);

//------------------------------------------Các dạng câu query tổng hợp (Aggregation Pipeline)----------
const getTourStats = catchAsync(async (req, res) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
        {
            $sort: { avgPrice: 1 },
        },
        // {
        //   $match: { _id: { $ne: 'EASY' } }
        // }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            stats,
        },
    });
});

//----------------Chức năng tính toán tháng bận rộn nhất trong năm----------------
const getMonthlyPlan = catchAsync(async (req, res) => {
    const year = req.params.year * 1; // 2021

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' },
            },
        },
        {
            $addFields: { month: '$_id' },
        },
        {
            //---không hiện _id, set 1 thì mới hiện _id
            $project: {
                _id: 0,
            },
        },
        {
            //---Sắp xếp giảm dần theo số lượng Tour trong tháng
            $sort: { numTourStarts: -1 },
        },
        // {
        //     $limit: 6,
        // },
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            plan,
        },
    });
});

const getToursWithin = catchAsync(async (req, res, next) => {
    //      tours-within/:distance/center/:latlng/unit/:unit
    //  =>  /tours-within/233/center/-40,45/unit/mi

    //lng: kinh độ, lat: vĩ độ
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        next(
            new AppError(
                'Please provide latitutr and longitude in the format lat,lng.',
                400
            )
        );
    }

    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours,
        },
    });
});

const getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    //--mi: là đơn vị dặm
    const multiplier = unit === 'mi' ? 0.000621371192 : 0.001;

    if (!lat || !lng) {
        next(
            new AppError(
                'Please provide latitute and longitude in the format lat,lng.',
                400
            )
        );
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    //lng: kinh độ, lat: vĩ độ
                    coordinates: [lng * 1, lat * 1],
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier,
            },
        },
        //--- $project: tên các trường muốn giữ lại
        {
            $project: {
                distance: 1,
                name: 1,
            },
        },
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distances,
        },
    });
});

module.exports = {
    createTour,
    aliasTopTours,
    getAllTours,
    getTour,
    updateTour,
    deleteTour,
    getTourStats,
    getMonthlyPlan,
    setTourId,
    getToursWithin,
    getDistances,
    uploadTourImages,
    resizeTourImages,
};
