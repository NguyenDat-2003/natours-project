const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

//---mergeParams: cho phép truy cập Id từ một route khác
// EX: router.use('/:tourId/reviews', reviewRouter); ==> reviewRouter có thể truy cập tourId
const router = express.Router({ mergeParams: true });

//---Protect all routes after this middleware
router.use(authController.protect);

router
    .route('/')
    .get(authController.protect, reviewController.getAllReviews)
    .post(
        authController.restrictTo('user'),
        reviewController.setTourUserIds,
        reviewController.createReview
    );

router
    .route('/:id')
    .get(reviewController.getReview)
    .patch(
        authController.restrictTo('user', 'admin'),
        reviewController.updateReview
    )
    .delete(
        authController.restrictTo('user', 'admin'),
        reviewController.deleteReview
    );

module.exports = router;
