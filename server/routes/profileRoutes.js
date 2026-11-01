const express = require('express');
const router = express.Router();
const {
  getProfileMe,
  updateProfileMe,
  getProfileStats,
  addEducation,
  updateEducation,
  deleteEducation,
  addProject,
  updateProject,
  deleteProject,
  addCertification,
  updateCertification,
  deleteCertification,
  getProfileById
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

// Student profile operations (Protected)
router.get('/me', protect, getProfileMe);
router.put('/me', protect, updateProfileMe);
router.get('/stats', protect, getProfileStats);

// Education nested CRUD
router.post('/education', protect, addEducation);
router.put('/education/:eduId', protect, updateEducation);
router.delete('/education/:eduId', protect, deleteEducation);

// Projects nested CRUD
router.post('/projects', protect, addProject);
router.put('/projects/:projId', protect, updateProject);
router.delete('/projects/:projId', protect, deleteProject);

// Certifications nested CRUD
router.post('/certifications', protect, addCertification);
router.put('/certifications/:certId', protect, updateCertification);
router.delete('/certifications/:certId', protect, deleteCertification);

// Public / Admin Profile View by ID
router.get('/:id', getProfileById);

module.exports = router;
