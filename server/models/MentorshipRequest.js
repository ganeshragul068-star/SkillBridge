const mongoose = require('mongoose');

const mentorshipRequestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required']
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mentor',
      required: [true, 'Mentor ID is required']
    },
    message: {
      type: String,
      required: [true, 'Mentorship request message is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Accepted', 'Rejected', 'Cancelled'],
        message: 'Status must be Pending, Accepted, Rejected, or Cancelled'
      },
      default: 'Pending'
    },
    mentorResponse: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Response cannot exceed 2000 characters']
    },
    statusChangedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

mentorshipRequestSchema.index({ studentId: 1, mentorId: 1, status: 1 });

const MongooseMentorshipRequest = mongoose.models.MentorshipRequest || mongoose.model('MentorshipRequest', mentorshipRequestSchema);
const createRepository = require('../repositories/createRepository');
module.exports = createRepository('mentorshipRequests', MongooseMentorshipRequest);
