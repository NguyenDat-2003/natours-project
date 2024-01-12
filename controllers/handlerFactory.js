const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

const getAll = (Model) => {
    return catchAsync(async (req, res) => {
        // To allow for nested GET reviews on tour (hack)
        let filter = {};
        if (req.params.tourId) filter = { tour: req.params.tourId };

        //---- Model.find() return về một query
        const features = new APIFeatures(Model.find(filter), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        // EXECUTE QUERY
        const doc = await features.query;

        // SEND RESPONSE
        res.status(200).json({
            status: 'success',
            results: doc.length,
            data: {
                doc,
            },
        });
    });
};

const getOne = (Model, popOptions) => {
    return catchAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id);
        if (popOptions) query = query.populate(popOptions);
        const doc = await query;

        if (!doc) {
            return next(new AppError('Document not found', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                doc,
            },
        });
    });
};

const deleteOne = (Model) => {
    return catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            return next(new AppError('Document not found', 404));
        }

        res.status(204).json({
            status: 'success',
            data: null,
        });
    });
};

const updateOne = (Model) => {
    return catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!doc) {
            return next(new AppError('Document not found', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                doc,
            },
        });
    });
};

const createOne = (Model) => {
    return catchAsync(async (req, res, next) => {
        const newDoc = await Model.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                tour: newDoc,
            },
        });
    });
};

module.exports = { deleteOne, updateOne, createOne, getOne, getAll };