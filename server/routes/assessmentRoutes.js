const express = require('express');
const router = express.Router();
const {
  getAssessments,
  getAssessmentById,
  startAssessment,
  submitAssessment
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAssessments);
router.get('/:id', getAssessmentById);
router.post('/:id/start', protect, startAssessment);
router.post('/:id/submit', protect, submitAssessment);

module.exports = router;
