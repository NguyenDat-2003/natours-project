const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            require: [true, 'Review can not be empty'],
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        creatAt: {
            type: Date,
            default: Date.now(),
        },
        //----Use Referencing (Parent Referencing)
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            require: [true, 'Review must belong to a tour'],
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            require: [true, 'Review must belong to a user'],
        },
    },
    //--Virtuals property sẽ không được lưu trong database
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'tour',
        select: 'name',
    }).populate({
        path: 'user',
        select: 'name photo',
    });
    next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;