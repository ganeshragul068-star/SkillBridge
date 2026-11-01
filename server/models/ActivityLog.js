const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true
    },
    targetType: {
      type: String,
      enum: ['student', 'job', 'application', 'course', 'assessment', 'platform'],
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId
    },
    targetTitle: {
      type: String,
      default: '',
      trim: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    performedByName: {
      type: String,
      default: 'Administrator',
      trim: true
    },
    performedByRole: {
      type: String,
      default: 'admin'
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

activityLogSchema.index({ createdAt: -1 });

const MongooseActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
const createRepository = require('../repositories/createRepository');
module.exports = createRepository('activityLogs', MongooseActivityLog);
