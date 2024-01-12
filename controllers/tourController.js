const fs = require('fs');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

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
};
