/* eslint-disable prettier/prettier */
const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const router = express.Router();

// router.param('id', tourController.checkID)

router.route('/top-5-tours')
.get(tourController.aliase, tourController.getAllTours);

router.route('/get-tour-stats')
.get(tourController.getTourStats);

router.route('/monthly-plan/:year')
.get(tourController.getMonthlyPlan);

router
.route('/')
.get( authController.protect ,tourController.getAllTours)
.post(tourController.addNewTour)

router
.route('/:id')
.get(tourController.getTourbyID)
.patch(tourController.updateTour)
.delete( authController.protect, authController.restrictTo('admin','lead-guide'),  tourController.deleteTour)


module.exports = router;