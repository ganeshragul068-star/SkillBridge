const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.get('/status', aiController.getAiStatus);
router.post('/resume-analysis', aiController.analyzeResume);

module.exports = router;
