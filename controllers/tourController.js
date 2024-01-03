const fs = require('fs');
const Tour = require('../models/tourModel');

const createTour = async (req, res) => {
    try {
        // const newTour = new Tour({});
        // newTour.save()

        const newTour = await Tour.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: 'Invalid data sent!',
        });
    }
};

const aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

const getAllTours = async (req, res) => {
    try {
        //-------BUILD QUERY
        //1A) Filtering
        const queryObj = { ...req.query };

        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach((el) => delete queryObj[el]);

        //1B) Advance filtering: gte: greather than equal, gt: grather than,lte: less than equal

        const regixAdvanceFilter = /\b(gte|gt|lte|lt)\b/g;
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(regixAdvanceFilter, (match) => `$${match}`);

        let query = Tour.find(JSON.parse(queryStr));

        //2)SORTING
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            //Có thể sử dụng xâu chuỗi nhiều phương thức query
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        //3) LIMITTING
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            //Select tất cả ngoại trừ field: "__v"
            query = query.select('-__v');
        }

        //4)Pagination
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 100;
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);

        if (req.query.page) {
            const numTours = await Tour.countDocuments();
            if (skip >= numTours) throw new Error('This page dose not Exist');
        }

        //-------EXECUTE QUERY
        const tours = await query;

        // const query =  Tour.find()
        //     .where('duration')
        //     .equals(5)
        //     .where('difficulty')
        //     .equals('easy');

        //------- SEND RESPONSE
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: tours,
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err,
        });
    }
};

const getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);

        res.status(200).json({
            status: 'success',
            data: tour,
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err,
        });
    }
};

const updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            status: 'success',
            data: tour,
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err,
        });
    }
};

const deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err,
        });
    }
};

module.exports = {
    createTour,
    aliasTopTours,
    getAllTours,
    getTour,
    updateTour,
    deleteTour,
};
