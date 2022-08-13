const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const express = require('express');
const router = express.Router({mergeParams: true});
// Login must to proceed further
router.use(authController.protect);

router
.route('/')
.get( reviewController.getAllReviews)
.post(
    authController.restrictTo('user'), 
    reviewController.createReview)

router.route('/:id')
.get(reviewController.getReviewById)
.post( authController.restrictTo('user', 'admin'), reviewController.updateReview)
.delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview)

module.exports = router; 