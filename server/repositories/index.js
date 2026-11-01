const createRepository = require('./createRepository');
const { DemoDataStore } = require('./dataStore');
const { isDemoMode, getDataMode } = require('../config/dataMode');

// Preserve direct access to repositories
const repositories = {
  User: null,
  Profile: null,
  Job: null,
  Application: null,
  SavedJob: null,
  Course: null,
  Assessment: null,
  AssessmentResult: null,
  LearningProgress: null,
  Resume: null,
  ResumeAnalysis: null,
  ActivityLog: null,
  DemoDataStore,
  isDemoMode,
  getDataMode
};

// Lazy getter helpers to avoid circular dependencies
Object.defineProperties(repositories, {
  User: { get: () => require('../models/User') },
  Profile: { get: () => require('../models/Profile') },
  Job: { get: () => require('../models/Job') },
  Application: { get: () => require('../models/Application') },
  SavedJob: { get: () => require('../models/SavedJob') },
  Course: { get: () => require('../models/Course') },
  Assessment: { get: () => require('../models/Assessment') },
  AssessmentResult: { get: () => require('../models/AssessmentResult') },
  LearningProgress: { get: () => require('../models/LearningProgress') },
  Resume: { get: () => require('../models/Resume') },
  ResumeAnalysis: { get: () => require('../models/ResumeAnalysis') },
  ActivityLog: { get: () => require('../models/ActivityLog') }
});

module.exports = repositories;
