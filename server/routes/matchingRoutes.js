const express = require('express');
const router = express.Router();
const {
  getMatchingJobs,
  getJobMatchById,
  getMatchingSummary
} = require('../controllers/matchingController');
const { protect } = require('../middleware/authMiddleware');

// All matching endpoints require authentication
router.use(protect);

router.get('/jobs', getMatchingJobs);
router.get('/summary', getMatchingSummary);
router.get('/jobs/:jobId', getJobMatchById);

module.exports = router;
