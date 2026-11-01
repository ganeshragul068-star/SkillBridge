const mongoose = require('mongoose');

const educationItemSchema = new mongoose.Schema({
  institution: { type: String, required: true, trim: true },
  degree: { type: String, required: true, trim: true },
  fieldOfStudy: { type: String, default: '', trim: true },
  startYear: { type: Number },
  endYear: { type: Number },
  grade: { type: String, default: '', trim: true },
  location: { type: String, default: '', trim: true }
});

const experienceItemSchema = new mongoose.Schema({
  company: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  location: { type: String, default: '', trim: true },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  current: { type: Boolean, default: false },
  description: { type: String, default: '' },
  bulletPoints: [{ type: String, trim: true }]
});

const projectItemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  technologies: [{ type: String, trim: true }],
  liveUrl: { type: String, default: '', trim: true },
  githubUrl: { type: String, default: '', trim: true },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  bulletPoints: [{ type: String, trim: true }]
});

const certificationItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  issuingOrganization: { type: String, required: true, trim: true },
  issueDate: { type: String, default: '' },
  credentialId: { type: String, default: '', trim: true },
  credentialUrl: { type: String, default: '', trim: true }
});

const skillItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, default: 'Technical Skills', trim: true },
  proficiency: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Intermediate' }
});

const resumeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID reference is required']
    },
    title: {
      type: String,
      required: [true, 'Resume title is required'],
      trim: true,
      default: 'Full Stack Developer Resume'
    },
    targetRole: {
      type: String,
      default: 'Full Stack MERN Developer',
      trim: true
    },
    template: {
      type: String,
      enum: ['classic', 'modern', 'ats'],
      default: 'ats'
    },
    personalInfo: {
      fullName: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      phone: { type: String, default: '', trim: true },
      location: { type: String, default: '', trim: true },
      linkedinUrl: { type: String, default: '', trim: true },
      githubUrl: { type: String, default: '', trim: true },
      portfolioUrl: { type: String, default: '', trim: true },
      summary: { type: String, default: '', trim: true }
    },
    education: [educationItemSchema],
    experience: [experienceItemSchema],
    projects: [projectItemSchema],
    skills: [skillItemSchema],
    certifications: [certificationItemSchema],
    customSections: [
      {
        heading: { type: String, trim: true },
        content: { type: String }
      }
    ],
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

resumeSchema.index({ studentId: 1, createdAt: -1 });

const MongooseResume = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);
const createRepository = require('../repositories/createRepository');
module.exports = createRepository('resumes', MongooseResume);
