const express = require('express');
const router = express.Router();
const {
  getAssessmentAttempt,
  submitAssessmentAttempt
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/:id', getAssessmentAttempt);
router.post('/:id/submit', submitAssessmentAttempt);

module.exports = router;
