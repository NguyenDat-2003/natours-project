const express = require('express');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES

//---static file
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet({ contentSecurityPolicy: false }));

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 60 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 60 minutes)
    standardHeaders: 'draft-7', // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
    legacyHeaders: false, // X-RateLimit-* headers
    message: 'Too many requests from this IP, please try again in an hour!',
});

// Apply the rate limiting middleware to all requests
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

//----
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//4) Phần mềm trung gian xử lý lỗi (MiddleWare Error)
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
