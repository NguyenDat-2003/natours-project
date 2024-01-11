const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

//---mergeParams: cho phép truy cập Id từ một route khác
// EX: router.use('/:tourId/reviews', reviewRouter); ==> reviewRouter có thể truy cập tourId
const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(authController.protect, reviewController.getAllReviews)
    .post(
        authController.protect,
        authController.restrictTo('user'),
        reviewController.createReview
    );

router
    .route('/:id')
    .delete(
        authController.protect,
        authController.restrictTo('user', 'admin'),
        reviewController.deleteReview
    );

module.exports = router;
