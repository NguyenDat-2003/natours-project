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

const getTour = (req, res) => {
    res.status(200).render('tour', {
        title: 'Tour',
    });
};
module.exports = { getOverview, getTour };
