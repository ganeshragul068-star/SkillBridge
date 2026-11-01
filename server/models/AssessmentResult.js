const mongoose = require('mongoose');

const studentAnswerSubSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  selectedAnswer: { type: Number, required: true }, // -1 if unanswered
  isCorrect: { type: Boolean, default: false },
  marksAwarded: { type: Number, default: 0 },
  questionText: { type: String, default: '' },
  options: [{ type: String }],
  correctAnswer: { type: Number },
  explanation: { type: String, default: '' }
});

const assessmentResultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'timed-out'],
      default: 'completed'
    },
    score: {
      type: Number,
      default: 0
    },
    totalMarks: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    passed: {
      type: Boolean,
      default: false
    },
    proficiencyLevel: {
      type: String,
      enum: ['Needs Improvement', 'Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner'
    },
    correctCount: {
      type: Number,
      default: 0
    },
    incorrectCount: {
      type: Number,
      default: 0
    },
    unansweredCount: {
      type: Number,
      default: 0
    },
    timeSpentSeconds: {
      type: Number,
      default: 0
    },
    attemptNumber: {
      type: Number,
      default: 1
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: {
      type: Date
    },
    expiresAt: {
      type: Date
    },
    answers: [studentAnswerSubSchema],
    completedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

assessmentResultSchema.index({ studentId: 1, assessmentId: 1, createdAt: -1 });

const MongooseAssessmentResult = mongoose.models.AssessmentResult || mongoose.model('AssessmentResult', assessmentResultSchema);
const createRepository = require('../repositories/createRepository');
module.exports = createRepository('assessmentResults', MongooseAssessmentResult);
