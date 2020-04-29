const express = require('express');
const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses');

// Include other resource router
// const feedbackRouter = require('./feedbacks');
const reviewRouter = require('./reviews');

const Course = require('../models/Course');
const Review = require('../models/Review');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router({ mergeParams: true });

// Re-route into other resource router
// router.use('/:courseId/feedbacks', feedbackRouter);
router.use('/:courseId/reviews', reviewRouter);

// Protect Middleware
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(Course, { path: 'reviews', select: 'rating' }),
    getCourses
  )
  .post(protect, addCourse);

router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('publisher', 'admin'), updateCourse)
  .delete(protect, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;
