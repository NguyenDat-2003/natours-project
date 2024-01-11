const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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

module.exports = { deleteOne, updateOne, createOne };
