const mongoose = require('mongoose');

// Skill Subschema
const skillSubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
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
      'AI and Machine Learning',
      'DevOps',
      'Tools and Technologies',
      'Soft Skills',
      'Frontend',
      'Backend',
      'Mobile',
      'Programming Language',
      'Other'
    ],
    default: 'Tools and Technologies'
  },
  proficiency: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  },
  yearsOfExperience: {
    type: Number,
    min: 0,
    max: 50,
    default: 0
  }
}, { timestamps: true });

// Education Subschema
const educationSubSchema = new mongoose.Schema({
  institution: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true
  },
  degree: {
    type: String,
    required: [true, 'Degree is required'],
    trim: true
  },
  department: {
    type: String,
    trim: true,
    default: ''
  },
  fieldOfStudy: {
    type: String,
    trim: true,
    default: ''
  },
  startYear: {
    type: Number,
    min: 1970,
    max: 2040
  },
  endYear: {
    type: Number,
    min: 1970,
    max: 2040
  },
  grade: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true });

// Project Subschema
const projectSubSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [120, 'Title cannot exceed 120 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: ''
  },
  technologies: [{
    type: String,
    trim: true
  }],
  techStack: [{
    type: String,
    trim: true
  }],
  projectUrl: {
    type: String,
    trim: true,
    default: ''
  },
  liveUrl: {
    type: String,
    trim: true,
    default: ''
  },
  githubUrl: {
    type: String,
    trim: true,
    default: ''
  },
  completionDate: {
    type: Date
  }
}, { timestamps: true });

// Certification Subschema
const certificationSubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Certification name is required'],
    trim: true
  },
  title: {
    type: String,
    trim: true
  },
  issuingOrganization: {
    type: String,
    required: [true, 'Issuing organization is required'],
    trim: true
  },
  issuer: {
    type: String,
    trim: true
  },
  issueDate: {
    type: Date
  },
  credentialId: {
    type: String,
    trim: true,
    default: ''
  },
  credentialUrl: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true });

// Main Profile Schema
const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    college: {
      type: String,
      default: '',
      trim: true
    },
    department: {
      type: String,
      default: '',
      trim: true
    },
    degree: {
      type: String,
      default: '',
      trim: true
    },
    graduationYear: {
      type: Number
    },
    location: {
      type: String,
      default: '',
      trim: true
    },
    bio: {
      type: String,
      default: '',
      maxlength: [2000, 'Bio cannot exceed 2000 characters']
    },
    profileImage: {
      type: String,
      default: ''
    },
    education: [educationSubSchema],
    projects: [projectSubSchema],
    certifications: [certificationSubSchema],
    interests: [{ type: String, trim: true }],
    skills: [skillSubSchema]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/**
 * Dynamic Profile Completion Calculator Method
 * Calculates percentage breakdown & tracks which sections are complete / incomplete.
 */
profileSchema.methods.calculateCompletion = function (userName) {
  let score = 0;
  const completedSections = [];
  const incompleteSections = [];

  // 1. Personal & Academic Info (20%)
  const hasAcademic = Boolean(
    (userName || (this.userId && this.userId.name)) &&
    this.college &&
    this.department &&
    this.degree &&
    this.graduationYear
  );
  if (hasAcademic) {
    score += 20;
    completedSections.push('Personal & Academic Profile');
  } else {
    incompleteSections.push('Personal & Academic Profile (College, Dept, Degree, Grad Year)');
  }

  // 2. Contact & Location (15%)
  const hasContact = Boolean(this.phone && this.location);
  if (hasContact) {
    score += 15;
    completedSections.push('Contact & Location');
  } else {
    incompleteSections.push('Contact Information (Phone & City Location)');
  }

  // 3. Professional Biography (15%)
  const hasBio = Boolean(this.bio && this.bio.trim().length >= 20);
  if (hasBio) {
    score += 15;
    completedSections.push('Professional Biography');
  } else {
    incompleteSections.push('Professional Biography (At least 20 characters)');
  }

  // 4. Technical Skills (20%)
  const hasSkills = Boolean(this.skills && this.skills.length >= 1);
  if (hasSkills) {
    score += 20;
    completedSections.push(`Technical Skills (${this.skills.length} added)`);
  } else {
    incompleteSections.push('Technical Skills Inventory (Add at least 1 verified skill)');
  }

  // 5. Portfolio Projects (15%)
  const hasProjects = Boolean(this.projects && this.projects.length >= 1);
  if (hasProjects) {
    score += 15;
    completedSections.push(`Portfolio Projects (${this.projects.length} added)`);
  } else {
    incompleteSections.push('Portfolio Projects (Add at least 1 academic or capstone project)');
  }

  // 6. Education Records (10%)
  const hasEducation = Boolean(this.education && this.education.length >= 1);
  if (hasEducation) {
    score += 10;
    completedSections.push(`Education History (${this.education.length} records)`);
  } else {
    incompleteSections.push('Education History (Add school or university credentials)');
  }

  // 7. Certifications (5%)
  const hasCertifications = Boolean(this.certifications && this.certifications.length >= 1);
  if (hasCertifications) {
    score += 5;
    completedSections.push(`Certifications (${this.certifications.length} verified)`);
  } else {
    incompleteSections.push('Certifications (Add course or industry credentials)');
  }

  return {
    completionPercentage: Math.min(100, score),
    completedSections,
    incompleteSections,
    totalSkills: this.skills ? this.skills.length : 0,
    totalProjects: this.projects ? this.projects.length : 0,
    totalCertifications: this.certifications ? this.certifications.length : 0,
    totalEducation: this.education ? this.education.length : 0
  };
};

const MongooseProfile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);
const createRepository = require('../repositories/createRepository');
module.exports = createRepository('profiles', MongooseProfile);
