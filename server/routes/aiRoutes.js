const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.get('/status', aiController.getAiStatus);
router.post('/resume-analysis', aiController.analyzeResume);
router.post('/generate-summary', aiController.generateSummary);
router.post('/improve-project', aiController.improveProject);

module.exports = router;
