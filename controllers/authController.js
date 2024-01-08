const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');

const signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        //---JWT hết hạn sau 90 ngày
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(201).json({
        status: 'success',
        token,
        data: { user: newUser },
    });
});

module.exports = { signup };
