const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const getOverview = catchAsync(async (req, res) => {
    //1) Get tour data from collection
    const tours = await Tour.find();

    //2) Build Template
    //3) Render that tmplate using tour data from 1)

    res.status(200).render('overview', {
        title: 'All Tours',
        tours,
    });
});

const getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user',
    });

    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
    }

    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour,
    });
});

const getSignUpForm = catchAsync(async (req, res) => {
    res.status(200).render('signup', {
        title: 'Sign Up',
    });
});
const getLoginForm = catchAsync(async (req, res) => {
    res.status(200).render('login', {
        title: 'Log In',
    });
});

const getAccount = catchAsync(async (req, res) => {
    res.status(200).render('account', {
        title: 'Your Account',
    });
});

const getMyTours = catchAsync(async (req, res, next) => {
    // 1) Find all bookings
    const bookings = await Booking.find({ user: req.user.id });

    // 2) Find tours with the returned IDs
    const tourIDs = bookings.map((el) => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });

    res.status(200).render('overview', {
        title: 'My Tours',
        tours,
    });
});
module.exports = {
    getOverview,
    getTour,
    getLoginForm,
    getAccount,
    getMyTours,
    getSignUpForm,
};
