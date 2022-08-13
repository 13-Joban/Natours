/* eslint-disable prettier/prettier */
const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
// const reviewController = require('../controllers/reviewController')
const router = express.Router();
const reviewRouter = require('./reviewRouter');
const factory = require('../controllers/handleFactory');

// router.param('id', tourController.checkID)

router.use(
    '/:tourId/reviews',
    factory.nestedRoute({ param: 'tourId', modelField: 'tour' }),
    reviewRouter
  );

router.route('/top-5-tours')
.get(tourController.aliase, tourController.getAllTours);

router.route('/get-tour-stats')
.get(tourController.getTourStats);

router.route('/monthly-plan/:year')
.get(
  authController.protect, 
   authController.restrictTo('admin', 'lead-guide', 'guide'),
  tourController.getMonthlyPlan);

router
.route('/')
.get( tourController.getAllTours)
.post(authController.protect,  authController.restrictTo('admin', 'lead-guide'), tourController.addNewTour)

router
.route('/:id')
.get( tourController.getTourbyID)
.patch(authController.protect,  authController.restrictTo('admin', 'lead-guide'), tourController.updateTour)
.delete( authController.protect, authController.restrictTo('admin','lead-guide'),  tourController.deleteTour)


// router
// .route('/:tourId/reviews')
// .post(authController.protect,  reviewController.createReview)
// .get(authController.protect, reviewController.getAllReviews)

module.exports = router;