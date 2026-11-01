const mongoose = require('mongoose');

const questionSubSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  options: {
    type: [String],
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length >= 2;
      },
      message: 'A question must provide at least 2 options'
    },
    required: true
  },
  correctAnswer: {
    type: Number,
    required: [true, 'Correct option index is required'],
    min: 0
  },
  explanation: {
    type: String,
    default: '',
    trim: true
  },
  marks: {
    type: Number,
    default: 1,
    min: 1
  }
});

const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assessment title is required'],
      trim: true
    },
    skill: {
      type: String,
      required: [true, 'Target skill is required'],
      trim: true
    },
    category: {
      type: String,
      enum: [
        'Programming Languages',
        'Frontend Development',
        'Backend Development',
        'Database',
        'Cloud Computing',
        'DevOps',
        'Data Structures',
        'Other'
      ],
      default: 'Programming Languages'
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate'
    },
    description: {
      type: String,
      required: [true, 'Assessment description is required']
    },
    questions: [questionSubSchema],
    duration: {
      type: Number,
      default: 20, // in minutes
      min: [5, 'Duration must be at least 5 minutes']
    },
    passingScore: {
      type: Number,
      default: 70, // percentage
      min: 1,
      max: 100
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for total marks
assessmentSchema.virtual('totalMarks').get(function () {
  if (!this.questions || !this.questions.length) return 0;
  return this.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
});

// Virtual for question count
assessmentSchema.virtual('totalQuestions').get(function () {
  return this.questions ? this.questions.length : 0;
});

assessmentSchema.index({ skill: 1, isActive: 1 });
assessmentSchema.index({ category: 1, difficulty: 1 });

const MongooseAssessment = mongoose.models.Assessment || mongoose.model('Assessment', assessmentSchema);
const createRepository = require('../repositories/createRepository');
module.exports = createRepository('assessments', MongooseAssessment);
