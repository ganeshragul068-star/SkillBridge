const mongoose = require('mongoose');
const MentorshipRequest = require('../models/MentorshipRequest');
const Mentor = require('../models/Mentor');
const User = require('../models/User');

// @desc    Create a mentorship request to a mentor
// @route   POST /api/mentorship-requests
// @access  Private (Student)
exports.createMentorshipRequest = async (req, res, next) => {
  try {
    const { mentorId, message } = req.body;

    if (!mentorId) {
      res.status(400);
      throw new Error('Mentor ID is required');
    }

    if (!message || !message.trim()) {
      res.status(400);
      throw new Error('Please include a message explaining your learning goals');
    }

    // Verify mentor exists and is active
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      res.status(404);
      throw new Error('Mentor not found');
    }

    if (!mentor.isActive) {
      res.status(400);
      throw new Error('This mentor is currently inactive and cannot accept new requests');
    }

    // Guard: Prevent duplicate pending requests to the same mentor
    const existingPending = await MentorshipRequest.findOne({
      studentId: req.user._id,
      mentorId,
      status: 'Pending'
    });

    if (existingPending) {
      res.status(400);
      throw new Error('You already have a pending mentorship request to this mentor. Please await their response.');
    }

    const request = await MentorshipRequest.create({
      studentId: req.user._id,
      mentorId,
      message: message.trim(),
      status: 'Pending',
      statusChangedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: `Mentorship request sent to ${mentor.name}`,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all mentorship requests sent by authenticated student
// @route   GET /api/mentorship-requests/my
// @access  Private (Student)
exports.getMyRequests = async (req, res, next) => {
  try {
    const requests = await MentorshipRequest.find({ studentId: req.user._id })
      .populate('mentorId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get received mentorship requests (For Mentors or Admin view)
// @route   GET /api/mentorship-requests/received
// @access  Private (Mentor / Admin)
exports.getReceivedRequests = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.mentorId) {
      filter.mentorId = req.query.mentorId;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const requests = await MentorshipRequest.find(filter)
      .populate('studentId', 'name email role')
      .populate('mentorId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update mentorship request status (Accept or Reject)
// @route   PATCH /api/mentorship-requests/:id/status
// @access  Private (Mentor / Admin)
exports.updateRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, mentorResponse } = req.body;

    if (!['Accepted', 'Rejected'].includes(status)) {
      res.status(400);
      throw new Error('Status must be Accepted or Rejected');
    }

    const request = await MentorshipRequest.findById(id);
    if (!request) {
      res.status(404);
      throw new Error('Mentorship request not found');
    }

    if (request.status === 'Cancelled') {
      res.status(400);
      throw new Error('Cannot modify a request that was cancelled by the student');
    }

    request.status = status;
    if (mentorResponse && mentorResponse.trim()) {
      request.mentorResponse = mentorResponse.trim();
    }
    request.statusChangedAt = new Date();
    await request.save();

    res.status(200).json({
      success: true,
      message: `Mentorship request has been ${status.toLowerCase()}`,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel student's own pending request
// @route   PATCH /api/mentorship-requests/:id/cancel
// @access  Private (Student)
exports.cancelMyRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await MentorshipRequest.findById(id);

    if (!request) {
      res.status(404);
      throw new Error('Mentorship request not found');
    }

    // Student isolation guard: Cannot cancel another student's request
    if (request.studentId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized: You can only cancel your own mentorship requests');
    }

    if (request.status !== 'Pending') {
      res.status(400);
      throw new Error(`Cannot cancel a request that is already ${request.status}`);
    }

    request.status = 'Cancelled';
    request.statusChangedAt = new Date();
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Mentorship request cancelled successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin view all platform mentorship requests with filters
// @route   GET /api/admin/mentorship-requests
// @access  Private (Admin)
exports.getAdminAllRequests = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.mentorId) {
      filter.mentorId = req.query.mentorId;
    }

    const requests = await MentorshipRequest.find(filter)
      .populate('studentId', 'name email role')
      .populate('mentorId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};
