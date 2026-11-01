const express = require('express');
const router = express.Router();

const {
  getAllMentors,
  getMentorById,
  getRecommendedMentors,
  getMentorMatchDetails
} = require('../controllers/mentorController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Public / Authenticated Mentor Discovery
router.get('/', getAllMentors);

// Student Personalized Mentor Recommendations & Matching
router.get('/recommendations', protect, authorize('student'), getRecommendedMentors);
router.get('/:id/match-details', protect, authorize('student'), getMentorMatchDetails);

// Individual Mentor Profile
router.get('/:id', getMentorById);

module.exports = router;
