const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Please add a course Title'],
    },

    description: {
      type: String,
      required: [true, 'Please add a description'],
    },

    weeks: {
      type: String,
      required: [true, 'Please add number of weeks'],
    },

    tuition: {
      type: Number,
      required: [true, 'Please add a course Tuition fee'],
    },

    minimumSkill: {
      type: String,
      required: [true, 'Please add minimum Skills'],
      enum: ['beginner', 'intermediate', 'advance'],
    },

    scholarshipAvailable: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    bootcamp: {
      type: mongoose.Schema.ObjectId,
      ref: 'Bootcamp',
      required: true,
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Reverse populate with virtuals
CourseSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'course',
  justOne: false,
});

module.exports = mongoose.model('Course', CourseSchema);
