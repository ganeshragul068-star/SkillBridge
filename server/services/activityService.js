const ActivityLog = require('../models/ActivityLog');

/**
 * Record an administrative or platform activity log entry
 * @param {Object} options
 * @param {String} options.action - Action identifier (e.g. 'STUDENT_DEACTIVATED', 'JOB_CREATED')
 * @param {String} options.targetType - 'student' | 'job' | 'application' | 'course' | 'assessment' | 'platform'
 * @param {String} options.targetId - ID of target entity
 * @param {String} options.targetTitle - Human-readable title of target entity
 * @param {Object} options.admin - Authenticated admin user document (req.user)
 * @param {Object} options.details - Additional context / metadata
 */
async function recordActivity({
  action,
  targetType,
  targetId = null,
  targetTitle = '',
  admin = null,
  details = {}
}) {
  try {
    const performedBy = admin ? (admin._id || admin.id) : null;
    const performedByName = admin ? (admin.name || 'Administrator') : 'Platform System';
    const performedByRole = admin ? (admin.role || 'admin') : 'admin';

    const logEntry = await ActivityLog.create({
      action,
      targetType,
      targetId,
      targetTitle,
      performedBy,
      performedByName,
      performedByRole,
      details
    });

    return logEntry;
  } catch (error) {
    // Non-blocking log failure
    console.error('[ActivityLog Error]: Failed to record activity log:', error.message);
    return null;
  }
}

/**
 * Retrieve recent platform activity logs with filtering and pagination
 */
async function getActivityLogs({ action, targetType, limit = 20, page = 1 } = {}) {
  const query = {};
  if (action && action !== 'All') {
    query.action = action;
  }
  if (targetType && targetType !== 'All') {
    query.targetType = targetType;
  }

  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const skip = (pageNum - 1) * limitNum;

  const total = await ActivityLog.countDocuments(query);
  const logs = await ActivityLog.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  return {
    logs,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1
  };
}

module.exports = {
  recordActivity,
  getActivityLogs
};
