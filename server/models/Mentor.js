const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Mentor name is required'],
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Professional title is required'],
      trim: true
    },
    profileImage: {
      type: String,
      default: '',
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    },
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true
    },
    yearsOfExperience: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience cannot be negative'],
      default: 1
    },
    technicalSkills: [{
      type: String,
      trim: true
    }],
    areasOfExpertise: [{
      type: String,
      trim: true
    }],
    careerDomains: [{
      type: String,
      trim: true
    }],
    bio: {
      type: String,
      required: [true, 'Biography is required'],
      trim: true
    },
    availability: {
      type: String,
      default: 'Available',
      trim: true
    },
    preferredMode: {
      type: String,
      enum: {
        values: ['online', 'offline', 'hybrid'],
        message: 'Preferred mode must be online, offline, or hybrid'
      },
      default: 'online'
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

mentorSchema.index({ name: 'text', title: 'text', technicalSkills: 'text', industry: 'text' });

const MongooseMentor = mongoose.models.Mentor || mongoose.model('Mentor', mentorSchema);
const createRepository = require('../repositories/createRepository');
module.exports = createRepository('mentors', MongooseMentor);
