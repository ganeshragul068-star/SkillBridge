const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume'
    },
    resumeTitle: {
      type: String,
      default: 'Student Resume',
      trim: true
    },
    targetRole: {
      type: String,
      default: 'General Technical Role',
      trim: true
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    jobTitle: {
      type: String,
      default: '',
      trim: true
    },
    company: {
      type: String,
      default: '',
      trim: true
    },
    source: {
      type: String,
      enum: ['saved-resume', 'uploaded-pdf', 'uploaded-docx', 'raw-text'],
      default: 'saved-resume'
    },
    fileName: {
      type: String,
      default: '',
      trim: true
    },
    matchPercentage: {
      type: Number,
      default: 0
    },
    matchingSkills: [{ type: String, trim: true }],
    missingSkills: [{ type: String, trim: true }],
    strengths: [{ type: String, trim: true }],
    improvements: [{ type: String, trim: true }],
    relevantProjects: [{ type: String, trim: true }],
    aiAnalysis: {
      type: Object,
      default: null
    },
    aiConfigured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

resumeAnalysisSchema.index({ studentId: 1, createdAt: -1 });

const MongooseResumeAnalysis = mongoose.models.ResumeAnalysis || mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
const createRepository = require('../repositories/createRepository');
module.exports = createRepository('resumeAnalyses', MongooseResumeAnalysis);
