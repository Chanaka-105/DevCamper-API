const express = require('express');
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  bootcampPhotoUpload,
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');

//Include other resource routers
const courseRouter = require('./courses');
// const reviewRouter = require('./reviews');

const router = express.Router();

// Protect middleware
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);
// router.use('/:bootcampId/reviews', reviewRouter);

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('publisher', 'admin'), createBootcamp);

router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

router
  .route('/:id')
  .get(getBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp);

module.exports = router;
