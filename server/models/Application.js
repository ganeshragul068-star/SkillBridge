const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    previousStatus: {
      type: String,
      required: true
    },
    newStatus: {
      type: String,
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required']
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required']
    },
    studentName: {
      type: String,
      default: ''
    },
    studentEmail: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    college: {
      type: String,
      default: ''
    },
    resumeUrl: {
      type: String,
      default: '',
      trim: true
    },
    coverLetter: {
      type: String,
      default: '',
      maxlength: [3000, 'Cover letter cannot exceed 3000 characters']
    },
    status: {
      type: String,
      enum: {
        values: ['Applied', 'Under Review', 'Shortlisted', 'Selected', 'Rejected', 'Withdrawn'],
        message: 'Invalid application status'
      },
      default: 'Applied'
    },
    statusHistory: [statusHistorySchema],
    appliedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound index to prevent duplicate applications by the same student for the same job
applicationSchema.index({ studentId: 1, jobId: 1 }, { unique: true });
applicationSchema.index({ status: 1, appliedAt: -1 });

const MongooseApplication = mongoose.models.Application || mongoose.model('Application', applicationSchema);
const createRepository = require('../repositories/createRepository');
module.exports = createRepository('applications', MongooseApplication);
