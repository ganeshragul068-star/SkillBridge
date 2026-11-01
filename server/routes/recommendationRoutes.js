const express = require('express');
const router = express.Router();
const {
  getCourseRecommendations,
  getJobCourseRecommendations
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/courses', getCourseRecommendations);
router.get('/courses/:jobId', getJobCourseRecommendations);

module.exports = router;
