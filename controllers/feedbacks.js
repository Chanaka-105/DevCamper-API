const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');
const Feedback = require('../models/Feedback');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

//@desc         Get Feedbakcs
//@route        GET/api/v1/reviews
//@route        GET/api/v1/courses/:courseId/feedbacks
//@access       public
exports.getFeedbacks = asyncHandler(async (req, res, next) => {
  if (req.params.courseId) {
    const feedbacks = await Feedback.find({ course: req.params.courseId });

    return res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//@desc         Get a single Review
//@route        GET/api/v1/reviews/:id
//@access       public
exports.getFeedback = asyncHandler(async (req, res, next) => {
  const feedbacks = await Feedback.findById(req.params.id).populate({
    path: 'course',
    select: 'title description',
  });

  if (!feedbacks) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: feedbacks,
  });
});

// //@desc         Add a single Review
// //@route        POST/api/v1/bootcamp/bootcampId/reviews
// //@access       private
// exports.addReview = asyncHandler(async (req, res, next) => {
//   req.body.bootcamp = req.params.bootcampId;
//   req.body.user = req.user.id;

//   const bootcamp = await Bootcamp.findById(req.params.bootcampId);

//   if (!bootcamp) {
//     return next(
//       new ErrorResponse(`No bootcamp with the id ${req.params.bootcampId}`, 404)
//     );
//   }

//   const review = await Review.create(req.body);

//   res.status(200).json({
//     success: true,
//     data: review,
//   });
// });

// //@desc         Update a single Review
// //@route        PUT/api/v1/reviews/:id
// //@access       private
// exports.updateReview = asyncHandler(async (req, res, next) => {
//   let review = await Review.findById(req.params.id);

//   if (!review) {
//     return next(
//       new ErrorResponse(`No Review with the id ${req.params.id}`, 404)
//     );
//   }

//   // Make sure review is belong to user or user is admin
//   if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
//     return next(new ErrorResponse(`Not Authorize to update review`, 401));
//   }
//   review = await Review.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   res.status(200).json({
//     success: true,
//     data: review,
//   });
// });

// //@desc         Delete a single Review
// //@route        DELETE/api/v1/reviews/:id
// //@access       private
// exports.deleteReview = asyncHandler(async (req, res, next) => {
//   const review = await Review.findById(req.params.id);

//   if (!review) {
//     return next(
//       new ErrorResponse(`No Review with the id ${req.params.id}`, 404)
//     );
//   }

//   // Make sure review is belong to user or user is admin
//   if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
//     return next(new ErrorResponse(`Not Authorize to update review`, 401));
//   }
//   await review.remove();

//   res.status(200).json({
//     success: true,
//     data: {},
//   });
// });
