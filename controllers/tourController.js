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
    getAllTours,
    getTour,
    updateTour,
    deleteTour,
};
