const express = require('express');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 60 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 60 minutes)
    standardHeaders: 'draft-7', // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
    legacyHeaders: false, // X-RateLimit-* headers
    message: 'Too many requests from this IP, please try again in an hour!',
});

// Apply the rate limiting middleware to all requests
app.use('/api', limiter);

app.use(express.json());
//---static file
app.use(express.static(path.join(__dirname, 'public')));
//----
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//4) Phần mềm trung gian xử lý lỗi (MiddleWare Error)
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
