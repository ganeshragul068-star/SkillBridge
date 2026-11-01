const express = require('express');
const router = express.Router();
const {
  getMyAssessmentResults,
  getAssessmentResultById
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/my', getMyAssessmentResults);
router.get('/:id', getAssessmentResultById);

module.exports = router;
