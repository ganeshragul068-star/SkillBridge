const express = require('express');
const router = express.Router();

const {
  createMentorshipRequest,
  getMyRequests,
  getReceivedRequests,
  updateRequestStatus,
  cancelMyRequest
} = require('../controllers/mentorshipRequestController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Student Mentorship Request Endpoints
router.post('/', protect, authorize('student'), createMentorshipRequest);
router.get('/my', protect, authorize('student'), getMyRequests);
router.patch('/:id/cancel', protect, authorize('student'), cancelMyRequest);

// Mentor / Admin Request Handling Endpoints
router.get('/received', protect, authorize('admin'), getReceivedRequests);
router.patch('/:id/status', protect, authorize('admin'), updateRequestStatus);

module.exports = router;
