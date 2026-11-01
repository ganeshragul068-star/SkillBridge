const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema(
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
    savedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate saved jobs
savedJobSchema.index({ studentId: 1, jobId: 1 }, { unique: true });

const MongooseSavedJob = mongoose.models.SavedJob || mongoose.model('SavedJob', savedJobSchema);
const createRepository = require('../repositories/createRepository');
module.exports = createRepository('savedJobs', MongooseSavedJob);
