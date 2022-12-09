const express = require('express');
//const tourController = require('./../controllers/tourController');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  discoverTours,
  getDistances,
  uploadTourImages,
  resizeTourImages,
} = require('../controllers/tourController');

const { protect, restrictTo } = require('../controllers/authController');

const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// aliasing top tours via middleware
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

// aggregation of tour stats
router.route('/tour-stats').get(getTourStats);

router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

// pass router params to checkID controller middleware function
//router.param('id', checkID);

// router.route('/').get(getAllTours).post(checkBody, createTour);

router
  .route('/discoverTours/:range/origin/:coordinate/unit/:unit')
  .get(discoverTours);

router.route('/distances/:coordinate/unit/:unit').get(getDistances);

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

// mount review router to creating tour's reviews route
router.use('/:id/reviews', reviewRouter);

module.exports = router;
