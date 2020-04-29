const express = require('express');
const { getFeedbacks, getFeedback } = require('../controllers/feedbacks');

// const Review = require('../models/Review');
const Feedback = require('../models/Feedback');

const advancedResults = require('../middleware/advancedResults');

const router = express.Router({ mergeParams: true });

// Protect Middleware
const { protect, authorize } = require('../middleware/auth');

router.route('/').get(getFeedbacks);

router.route('/:id').get(getFeedback);

module.exports = router;
