const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true
    },
    provider: {
      type: String,
      required: [true, 'Course provider is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Course description is required']
    },
    skillsCovered: [{
      type: String,
      trim: true
    }],
    difficulty: {
      type: String,
      enum: {
        values: ['Beginner', 'Intermediate', 'Advanced'],
        message: 'Difficulty must be Beginner, Intermediate, or Advanced'
      },
      default: 'Beginner'
    },
    duration: {
      type: String,
      default: 'Self-paced',
      trim: true
    },
    courseUrl: {
      type: String,
      default: '',
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

courseSchema.index({ title: 'text', skillsCovered: 'text', provider: 'text' });

const MongooseCourse = mongoose.models.Course || mongoose.model('Course', courseSchema);
const createRepository = require('../repositories/createRepository');
module.exports = createRepository('courses', MongooseCourse);
