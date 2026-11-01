const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    companyLogo: {
      type: String,
      default: '',
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Job description is required']
    },
    responsibilities: [{
      type: String,
      trim: true
    }],
    jobType: {
      type: String,
      enum: {
        values: ['Internship', 'Full-time', 'Part-time'],
        message: 'Job type must be Internship, Full-time, or Part-time'
      },
      default: 'Internship'
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    workMode: {
      type: String,
      enum: {
        values: ['Remote', 'Hybrid', 'On-site'],
        message: 'Work mode must be Remote, Hybrid, or On-site'
      },
      default: 'Remote'
    },
    requiredSkills: [{
      type: String,
      trim: true
    }],
    preferredSkills: [{
      type: String,
      trim: true
    }],
    qualifications: [{
      type: String,
      trim: true
    }],
    experience: {
      type: String,
      default: 'Fresher / Entry Level',
      trim: true
    },
    salary: {
      type: String,
      default: 'Stipend / Disclosed upon interview',
      trim: true
    },
    applicationDeadline: {
      type: Date
    },
    openings: {
      type: Number,
      default: 1,
      min: [1, 'Openings must be at least 1']
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Closed'],
        message: 'Status must be Active or Closed'
      },
      default: 'Active'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Job must have an admin creator reference']
    }
  },
  {
    timestamps: true
  }
);

// Method to verify whether the job is accepting applications
jobSchema.methods.isOpenForApplications = function () {
  if (this.status === 'Closed') return false;
  if (this.applicationDeadline && new Date(this.applicationDeadline) < new Date()) {
    return false;
  }
  return true;
};

// Search index for title, company, description, requiredSkills
jobSchema.index({ title: 'text', company: 'text', requiredSkills: 'text' });
jobSchema.index({ status: 1, jobType: 1, workMode: 1, createdAt: -1 });

const MongooseJob = mongoose.models.Job || mongoose.model('Job', jobSchema);
const createRepository = require('../repositories/createRepository');
module.exports = createRepository('jobs', MongooseJob);
