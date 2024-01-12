const mongoose = require('mongoose');
const Tour = require('./tourModel');

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
    // this.populate({
    //     path: 'tour',
    //     select: 'name',
    // }).populate({
    //     path: 'user',
    //     select: 'name photo',
    // });
    this.populate({
        path: 'user',
        select: 'name photo',
    });
    next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId },
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);
    // console.log(stats);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating,
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5,
        });
    }
};

//---Hàm này được gọi sau khi một review mới được tạo ra để update 2 fileds ratingsQuantity,ratingsAverage trong db
reviewSchema.post('save', function () {
    // this points to current review
    this.constructor.calcAverageRatings(this.tour);
});

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.findOne();
    // console.log(this.r);
    next();
});

reviewSchema.post(/^findOneAnd/, async function () {
    await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
