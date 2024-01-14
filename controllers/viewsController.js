const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

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

const getTour = catchAsync(async (req, res) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user',
    });
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour,
    });
});

const getLoginForm = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    res.status(200)
        .set(
            'Content-Security-Policy',
            "connect-src 'self' http://127.0.0.1:3000/"
        )
        .render('login', {
            title: 'Log In',
        });
});
module.exports = { getOverview, getTour, getLoginForm };
