const mongoose = require('mongoose');

const learningProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    skill: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true
    },
    targetRole: {
      type: String,
      default: 'Target Role',
      trim: true
    },
    stepNumber: {
      type: Number,
      default: 1
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started'
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium'
    },
    currentLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    },
    targetLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Advanced'
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }
    ],
    startedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }
    ],
    recommendedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }
    ],
    notes: {
      type: String,
      default: '',
      trim: true
    },
    skillsGained: [
      {
        type: String,
        trim: true
      }
    ],
    completedAt: {
      type: Date
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

learningProgressSchema.index({ studentId: 1, skill: 1 }, { unique: true });

const MongooseLearningProgress = mongoose.models.LearningProgress || mongoose.model('LearningProgress', learningProgressSchema);
const createRepository = require('../repositories/createRepository');
module.exports = createRepository('learningProgress', MongooseLearningProgress);
