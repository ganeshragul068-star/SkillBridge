const mongoose = require('mongoose');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Course = require('../models/Course');
const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
const LearningProgress = require('../models/LearningProgress');
const ActivityLog = require('../models/ActivityLog');
const { recordActivity, getActivityLogs } = require('../services/activityService');

// ============================================================================
// 1. ADMIN DASHBOARD METRICS & PLATFORM OVERVIEW
// ============================================================================

// @desc    Get aggregate platform metrics for admin dashboard
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
exports.getAdminDashboardMetrics = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const activeStudents = await User.countDocuments({ role: 'student', isActive: { $ne: false } });
    const inactiveStudents = totalStudents - activeStudents;

    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'Active' });
    const closedJobs = totalJobs - activeJobs;

    const totalApplications = await Application.countDocuments();
    const totalCourses = await Course.countDocuments();
    const activeCourses = await Course.countDocuments({ isActive: { $ne: false } });

    const totalAssessments = await Assessment.countDocuments();
    const activeAssessments = await Assessment.countDocuments({ isActive: { $ne: false } });

    // Applications breakdown by status
    const allApps = await Application.find({});
    const statusMap = {
      Applied: 0,
      'Under Review': 0,
      Shortlisted: 0,
      Selected: 0,
      Rejected: 0,
      Withdrawn: 0
    };

    allApps.forEach((app) => {
      const st = app.status || 'Applied';
      if (statusMap[st] !== undefined) {
        statusMap[st]++;
      } else {
        statusMap[st] = 1;
      }
    });

    // Recent 5 platform activities
    const recentActivities = await ActivityLog.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    // Count distinct colleges from student profiles
    const allProfiles = await Profile.find({});
    const distinctColleges = new Set(
      allProfiles.map((p) => p.college).filter((c) => c && c.trim().length > 0)
    );
    const collegesCount = Math.max(1, distinctColleges.size);

    const metricsData = {
      totalStudents,
      activeStudents,
      inactiveStudents,
      totalJobs,
      activeJobs,
      closedJobs,
      totalApplications,
      applicationsByStatus: statusMap,
      totalCourses,
      activeCourses,
      totalAssessments,
      activeAssessments,
      collegesCount,
      recentActivities
    };

    res.status(200).json({
      success: true,
      data: metricsData,
      overview: {
        totalUsers: totalStudents,
        totalJobs: activeJobs,
        totalApplications,
        colleges: collegesCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 2. STUDENT MANAGEMENT
// ============================================================================

// @desc    Get all students with search, active/inactive filters and pagination
// @route   GET /api/admin/students
// @access  Private (Admin only)
exports.getAdminStudents = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = { role: 'student' };

    if (status === 'active') {
      query.isActive = { $ne: false };
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const students = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Enrich students with profile details
    const studentIds = students.map((s) => s._id);
    const profiles = await Profile.find({
      $or: [{ userId: { $in: studentIds } }, { user: { $in: studentIds } }]
    });

    const profileMap = new Map();
    profiles.forEach((p) => {
      const uid = (p.userId || p.user)?.toString();
      if (uid) profileMap.set(uid, p);
    });

    const enriched = students.map((s) => {
      const sObj = s.toObject ? s.toObject() : { ...s };
      const p = profileMap.get(s._id.toString());
      sObj.profile = p
        ? {
            college: p.college || '',
            department: p.department || '',
            degree: p.degree || '',
            graduationYear: p.graduationYear || null,
            skillsCount: Array.isArray(p.skills) ? p.skills.length : 0,
            completionPercentage: p.completionPercentage || 0
          }
        : null;
      return sObj;
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: enriched
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed student dossier by ID (User, Profile, Learning Progress, Assessments, Applications)
// @route   GET /api/admin/students/:id
// @access  Private (Admin only)
exports.getAdminStudentById = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id).select('-password');

    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student account not found'
      });
    }

    const studentId = student._id;

    // Gather student records across models
    const [profile, progressRecords, assessmentResults, applications] = await Promise.all([
      Profile.findOne({
        $or: [{ userId: studentId }, { user: studentId }]
      }),
      LearningProgress.find({ studentId }).sort({ updatedAt: -1 }),
      AssessmentResult.find({ studentId }).populate('assessmentId', 'title skill category difficulty').sort({ completedAt: -1 }),
      Application.find({ studentId }).populate('jobId', 'title company location jobType salary').sort({ appliedAt: -1 })
    ]);

    res.status(200).json({
      success: true,
      data: {
        student,
        profile: profile || null,
        learningProgress: progressRecords,
        assessmentResults,
        applications
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate or deactivate student account
// @route   PATCH /api/admin/students/:id/toggle-status
// @access  Private (Admin only)
exports.toggleStudentStatus = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    // Safety guard: prevent administrator from deactivating themselves
    const currentAdminId = (req.user._id || req.user.id).toString();
    if (student._id.toString() === currentAdminId) {
      return res.status(400).json({
        success: false,
        message: 'Administrator cannot deactivate their own account'
      });
    }

    const previousStatus = student.isActive !== false;
    const newStatus = req.body.isActive !== undefined ? Boolean(req.body.isActive) : !previousStatus;

    student.isActive = newStatus;
    await student.save();

    await recordActivity({
      action: newStatus ? 'STUDENT_ACTIVATED' : 'STUDENT_DEACTIVATED',
      targetType: 'student',
      targetId: student._id,
      targetTitle: student.name,
      admin: req.user,
      details: {
        studentEmail: student.email,
        previousStatus,
        newStatus,
        reason: req.body.reason || 'Admin administrative status toggle'
      }
    });

    res.status(200).json({
      success: true,
      message: `Student account has been ${newStatus ? 'activated' : 'deactivated'} successfully`,
      data: {
        _id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        isActive: student.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with optional role and search filters
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAdminUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'All') {
      query.role = role;
    }

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 3. JOB & INTERNSHIP MANAGEMENT
// ============================================================================

// @desc    Get all jobs (Active and Closed) with applicant counts
// @route   GET /api/admin/jobs
// @access  Private (Admin only)
exports.getAdminJobs = async (req, res, next) => {
  try {
    const { status, jobType, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (jobType && jobType !== 'All') {
      query.jobType = jobType;
    }

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Compute applicant counts for each job
    const allApps = await Application.find({});
    const countMap = new Map();
    allApps.forEach((a) => {
      const jId = (a.jobId?._id || a.jobId)?.toString();
      if (jId) countMap.set(jId, (countMap.get(jId) || 0) + 1);
    });

    const enrichedJobs = jobs.map((j) => {
      const obj = j.toObject ? j.toObject() : { ...j };
      obj.applicantCount = countMap.get(j._id.toString()) || 0;
      return obj;
    });

    res.status(200).json({
      success: true,
      count: enrichedJobs.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: enrichedJobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create job listing as admin
// @route   POST /api/admin/jobs
// @access  Private (Admin only)
exports.createAdminJob = async (req, res, next) => {
  try {
    const {
      title,
      company,
      description,
      responsibilities,
      jobType,
      location,
      workMode,
      requiredSkills,
      qualifications,
      experience,
      salary,
      applicationDeadline,
      openings,
      status
    } = req.body;

    if (!title || !company || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide job title, company name, and description'
      });
    }

    const newJob = await Job.create({
      title: title.trim(),
      company: company.trim(),
      description,
      responsibilities: Array.isArray(responsibilities) ? responsibilities : (responsibilities ? [responsibilities] : []),
      jobType: jobType || 'Internship',
      location: location || 'Remote',
      workMode: workMode || 'Remote',
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (typeof requiredSkills === 'string' ? requiredSkills.split(',').map(s => s.trim()).filter(Boolean) : []),
      qualifications: Array.isArray(qualifications) ? qualifications : (qualifications ? [qualifications] : []),
      experience: experience || 'Fresher / Student',
      salary: salary || 'Disclosed upon interview',
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      openings: openings ? Number(openings) : 1,
      status: status || 'Active',
      createdBy: req.user._id || req.user.id
    });

    await recordActivity({
      action: 'JOB_CREATED',
      targetType: 'job',
      targetId: newJob._id,
      targetTitle: `${newJob.title} at ${newJob.company}`,
      admin: req.user,
      details: { jobType: newJob.jobType, workMode: newJob.workMode }
    });

    res.status(201).json({
      success: true,
      message: 'Job listing created successfully',
      data: newJob
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job listing as admin
// @route   PUT /api/admin/jobs/:id
// @access  Private (Admin only)
exports.updateAdminJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found'
      });
    }

    const payload = req.body;
    if (typeof payload.requiredSkills === 'string') {
      payload.requiredSkills = payload.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
    }

    Object.assign(job, payload);
    const updated = await job.save();

    await recordActivity({
      action: 'JOB_UPDATED',
      targetType: 'job',
      targetId: updated._id,
      targetTitle: `${updated.title} at ${updated.company}`,
      admin: req.user,
      details: { updatedFields: Object.keys(payload) }
    });

    res.status(200).json({
      success: true,
      message: 'Job listing updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job listing as admin
// @route   DELETE /api/admin/jobs/:id
// @access  Private (Admin only)
exports.deleteAdminJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found'
      });
    }

    const title = job.title;
    const company = job.company;
    await Job.findByIdAndDelete(req.params.id);

    await recordActivity({
      action: 'JOB_DELETED',
      targetType: 'job',
      targetId: req.params.id,
      targetTitle: `${title} at ${company}`,
      admin: req.user
    });

    res.status(200).json({
      success: true,
      message: 'Job listing deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle job active / closed status
// @route   PATCH /api/admin/jobs/:id/toggle-status
// @access  Private (Admin only)
exports.toggleJobStatus = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found'
      });
    }

    const newStatus = req.body.status || (job.status === 'Active' ? 'Closed' : 'Active');
    job.status = newStatus;
    await job.save();

    await recordActivity({
      action: 'JOB_STATUS_CHANGED',
      targetType: 'job',
      targetId: job._id,
      targetTitle: `${job.title} at ${job.company}`,
      admin: req.user,
      details: { newStatus }
    });

    res.status(200).json({
      success: true,
      message: `Job status updated to '${newStatus}'`,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for a specific job
// @route   GET /api/admin/jobs/:id/applications
// @access  Private (Admin only)
exports.getJobApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ jobId: req.params.id })
      .populate('studentId', 'name email createdAt')
      .populate('jobId', 'title company location status')
      .sort({ appliedAt: -1 });

    const studentUserIds = applications.map((a) => a.studentId?._id || a.studentId).filter(Boolean);
    const profiles = await Profile.find({
      $or: [{ userId: { $in: studentUserIds } }, { user: { $in: studentUserIds } }]
    });

    const profileMap = new Map();
    profiles.forEach((p) => {
      const uid = (p.userId || p.user)?.toString();
      if (uid) profileMap.set(uid, p);
    });

    const enriched = applications.map((app) => {
      const obj = app.toObject ? app.toObject() : { ...app };
      const sId = (app.studentId?._id || app.studentId)?.toString();
      obj.profile = profileMap.get(sId) || null;
      return obj;
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 4. APPLICATION MANAGEMENT
// ============================================================================

// @desc    Get all applications across platform with search, status filters and profile attachment
// @route   GET /api/admin/applications
// @access  Private (Admin only)
exports.getAdminApplications = async (req, res, next) => {
  try {
    const { status, jobId, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (jobId) {
      query.jobId = jobId;
    }

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { studentName: { $regex: q, $options: 'i' } },
        { studentEmail: { $regex: q, $options: 'i' } },
        { college: { $regex: q, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const total = await Application.countDocuments(query);

    const applications = await Application.find(query)
      .populate('studentId', 'name email createdAt')
      .populate('jobId', 'title company location jobType salary status')
      .populate('statusHistory.changedBy', 'name email role')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const studentUserIds = applications.map((a) => a.studentId?._id || a.studentId).filter(Boolean);
    const profiles = await Profile.find({
      $or: [{ userId: { $in: studentUserIds } }, { user: { $in: studentUserIds } }]
    });

    const profileMap = new Map();
    profiles.forEach((p) => {
      const uid = (p.userId || p.user)?.toString();
      if (uid) profileMap.set(uid, p);
    });

    const enriched = applications.map((app) => {
      const obj = app.toObject ? app.toObject() : { ...app };
      const sId = (app.studentId?._id || app.studentId)?.toString();
      obj.profile = profileMap.get(sId) || null;
      return obj;
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: enriched
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application by ID
// @route   GET /api/admin/applications/:id
// @access  Private (Admin only)
exports.getAdminApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('studentId', 'name email createdAt')
      .populate('jobId', 'title company location jobType salary status requiredSkills');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const sId = application.studentId?._id || application.studentId;
    const profile = await Profile.findOne({
      $or: [{ userId: sId }, { user: sId }]
    });

    const appObj = application.toObject ? application.toObject() : { ...application };
    appObj.profile = profile || null;

    res.status(200).json({
      success: true,
      data: appObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (Under Review, Shortlisted, Selected, Rejected, Withdrawn)
// @route   PUT /api/admin/applications/:id/status
// @access  Private (Admin only)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const allowedStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Selected', 'Rejected', 'Withdrawn'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('jobId', 'title company');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const previousStatus = application.status;
    application.status = status;

    if (!Array.isArray(application.statusHistory)) {
      application.statusHistory = [];
    }

    application.statusHistory.push({
      previousStatus,
      newStatus: status,
      changedBy: req.user._id || req.user.id,
      changedAt: new Date(),
      notes: notes || `Status updated from ${previousStatus} to ${status} by campus placement officer`
    });

    await application.save();

    await recordActivity({
      action: 'APPLICATION_STATUS_UPDATED',
      targetType: 'application',
      targetId: application._id,
      targetTitle: `Application for ${application.jobTitle || 'Role'} by ${application.studentName || 'Student'}`,
      admin: req.user,
      details: { previousStatus, newStatus: status, notes }
    });

    res.status(200).json({
      success: true,
      message: `Application status updated to '${status}'`,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 5. COURSE MANAGEMENT
// ============================================================================

// @desc    Get all courses with started/completed student counts
// @route   GET /api/admin/courses
// @access  Private (Admin only)
exports.getAdminCourses = async (req, res, next) => {
  try {
    const { search, difficulty, status } = req.query;
    const query = {};

    if (status === 'active') {
      query.isActive = { $ne: false };
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { provider: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query).sort({ createdAt: -1 });

    // Calculate enrolled student count from LearningProgress records
    const allProgress = await LearningProgress.find({});
    const enrolledMap = new Map();
    const completedMap = new Map();

    allProgress.forEach((p) => {
      const started = Array.isArray(p.startedCourses) ? p.startedCourses : [];
      const completed = Array.isArray(p.completedCourses) ? p.completedCourses : [];

      started.forEach((cId) => {
        const idStr = (cId?._id || cId).toString();
        enrolledMap.set(idStr, (enrolledMap.get(idStr) || 0) + 1);
      });

      completed.forEach((cId) => {
        const idStr = (cId?._id || cId).toString();
        completedMap.set(idStr, (completedMap.get(idStr) || 0) + 1);
      });
    });

    const enrichedCourses = courses.map((c) => {
      const obj = c.toObject ? c.toObject() : { ...c };
      const idStr = c._id.toString();
      obj.enrolledCount = enrolledMap.get(idStr) || 0;
      obj.completedCount = completedMap.get(idStr) || 0;
      return obj;
    });

    res.status(200).json({
      success: true,
      count: enrichedCourses.length,
      data: enrichedCourses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create course as admin
// @route   POST /api/admin/courses
// @access  Private (Admin only)
exports.createAdminCourse = async (req, res, next) => {
  try {
    const { title, provider, description, skillsCovered, difficulty, duration, courseUrl, isActive } = req.body;

    if (!title || !provider || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide course title, provider, and description'
      });
    }

    const newCourse = await Course.create({
      title: title.trim(),
      provider: provider.trim(),
      description,
      skillsCovered: Array.isArray(skillsCovered)
        ? skillsCovered
        : (typeof skillsCovered === 'string' ? skillsCovered.split(',').map(s => s.trim()).filter(Boolean) : []),
      difficulty: difficulty || 'Beginner',
      duration: duration || 'Self-paced',
      courseUrl: courseUrl || '',
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });

    await recordActivity({
      action: 'COURSE_CREATED',
      targetType: 'course',
      targetId: newCourse._id,
      targetTitle: newCourse.title,
      admin: req.user,
      details: { provider: newCourse.provider, difficulty: newCourse.difficulty }
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: newCourse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course as admin
// @route   PUT /api/admin/courses/:id
// @access  Private (Admin only)
exports.updateAdminCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const payload = req.body;
    if (typeof payload.skillsCovered === 'string') {
      payload.skillsCovered = payload.skillsCovered.split(',').map(s => s.trim()).filter(Boolean);
    }

    Object.assign(course, payload);
    const updated = await course.save();

    await recordActivity({
      action: 'COURSE_UPDATED',
      targetType: 'course',
      targetId: updated._id,
      targetTitle: updated.title,
      admin: req.user
    });

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course as admin
// @route   DELETE /api/admin/courses/:id
// @access  Private (Admin only)
exports.deleteAdminCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const title = course.title;
    await Course.findByIdAndDelete(req.params.id);

    await recordActivity({
      action: 'COURSE_DELETED',
      targetType: 'course',
      targetId: req.params.id,
      targetTitle: title,
      admin: req.user
    });

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle course active/inactive status
// @route   PATCH /api/admin/courses/:id/toggle-status
// @access  Private (Admin only)
exports.toggleCourseStatus = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const newStatus = req.body.isActive !== undefined ? Boolean(req.body.isActive) : !course.isActive;
    course.isActive = newStatus;
    await course.save();

    await recordActivity({
      action: 'COURSE_STATUS_CHANGED',
      targetType: 'course',
      targetId: course._id,
      targetTitle: course.title,
      admin: req.user,
      details: { isActive: newStatus }
    });

    res.status(200).json({
      success: true,
      message: `Course status updated to ${newStatus ? 'active' : 'inactive'}`,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student learning progress records for a course
// @route   GET /api/admin/courses/:id/progress
// @access  Private (Admin only)
exports.getCourseProgress = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const allProgress = await LearningProgress.find({});

    const matching = allProgress.filter((p) => {
      const started = (p.startedCourses || []).map((id) => (id?._id || id).toString());
      const completed = (p.completedCourses || []).map((id) => (id?._id || id).toString());
      return started.includes(courseId) || completed.includes(courseId);
    });

    res.status(200).json({
      success: true,
      count: matching.length,
      data: matching
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 6. PLATFORM ACTIVITY LOGS
// ============================================================================

// @desc    Get platform administrative activity logs
// @route   GET /api/admin/activity-logs
// @access  Private (Admin only)
exports.getAdminActivityLogs = async (req, res, next) => {
  try {
    const { action, targetType, limit = 20, page = 1 } = req.query;
    const result = await getActivityLogs({ action, targetType, limit, page });

    res.status(200).json({
      success: true,
      count: result.logs.length,
      total: result.total,
      page: result.page,
      pages: result.pages,
      data: result.logs
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 7. COMPREHENSIVE REPORTS & PLATFORM ANALYTICS
// ============================================================================

// @desc    Get comprehensive analytics and statistical reports from live demo data
// @route   GET /api/admin/reports/summary
// @access  Private (Admin only)
exports.getAdminReports = async (req, res, next) => {
  try {
    // 1. Student Statistics
    const allStudents = await User.find({ role: 'student' });
    const totalStudents = allStudents.length;
    const activeStudents = allStudents.filter((s) => s.isActive !== false).length;
    const inactiveStudents = totalStudents - activeStudents;
    const activePercentage = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;

    // 2. Job Statistics
    const allJobs = await Job.find({});
    const totalJobs = allJobs.length;
    const activeJobs = allJobs.filter((j) => j.status === 'Active').length;
    const closedJobs = totalJobs - activeJobs;

    const jobsByType = { Internship: 0, 'Full-time': 0, Contract: 0, Other: 0 };
    const jobsByWorkMode = { Remote: 0, Hybrid: 0, 'On-site': 0 };

    allJobs.forEach((j) => {
      const type = j.jobType || 'Other';
      if (jobsByType[type] !== undefined) jobsByType[type]++;
      else jobsByType.Other++;

      const wm = j.workMode || 'Remote';
      if (jobsByWorkMode[wm] !== undefined) jobsByWorkMode[wm]++;
    });

    // 3. Application Funnel & Status Distribution
    const allApplications = await Application.find({});
    const totalApplications = allApplications.length;

    const applicationStatusDistribution = {
      Applied: 0,
      'Under Review': 0,
      Shortlisted: 0,
      Selected: 0,
      Rejected: 0,
      Withdrawn: 0
    };

    allApplications.forEach((a) => {
      const st = a.status || 'Applied';
      if (applicationStatusDistribution[st] !== undefined) {
        applicationStatusDistribution[st]++;
      }
    });

    const selectionRate = totalApplications > 0
      ? Math.round(((applicationStatusDistribution.Selected || 0) / totalApplications) * 100)
      : 0;

    // 4. Course Statistics
    const allCourses = await Course.find({});
    const totalCourses = allCourses.length;
    const activeCourses = allCourses.filter((c) => c.isActive !== false).length;

    const allProgress = await LearningProgress.find({});
    let totalCourseStarts = 0;
    let totalCourseCompletions = 0;

    allProgress.forEach((p) => {
      totalCourseStarts += Array.isArray(p.startedCourses) ? p.startedCourses.length : 0;
      totalCourseCompletions += Array.isArray(p.completedCourses) ? p.completedCourses.length : 0;
    });

    const courseCompletionRate = totalCourseStarts > 0
      ? Math.round((totalCourseCompletions / totalCourseStarts) * 100)
      : 0;

    // 5. Assessment Performance & Proficiency Distribution
    const allResults = await AssessmentResult.find({});
    const totalAssessmentsTaken = allResults.length;
    const passedAssessments = allResults.filter((r) => r.passed).length;
    const assessmentPassRate = totalAssessmentsTaken > 0
      ? Math.round((passedAssessments / totalAssessmentsTaken) * 100)
      : 0;

    const totalScoreSum = allResults.reduce((sum, r) => sum + (r.percentage || 0), 0);
    const averageAssessmentScore = totalAssessmentsTaken > 0
      ? Math.round(totalScoreSum / totalAssessmentsTaken)
      : 0;

    const proficiencyDistribution = {
      'Needs Improvement': 0, // < 40%
      Beginner: 0,           // 40-59%
      Intermediate: 0,       // 60-79%
      Advanced: 0,           // 80-89%
      Expert: 0              // 90-100%
    };

    allResults.forEach((r) => {
      const p = r.percentage || 0;
      if (p < 40) proficiencyDistribution['Needs Improvement']++;
      else if (p < 60) proficiencyDistribution.Beginner++;
      else if (p < 80) proficiencyDistribution.Intermediate++;
      else if (p < 90) proficiencyDistribution.Advanced++;
      else proficiencyDistribution.Expert++;
    });

    // 6. Student Skill Distribution
    const allProfiles = await Profile.find({});
    const skillCountMap = {};

    allProfiles.forEach((prof) => {
      if (Array.isArray(prof.skills)) {
        prof.skills.forEach((s) => {
          const sName = typeof s === 'string' ? s : (s.name || s.skillName);
          if (sName) {
            skillCountMap[sName] = (skillCountMap[sName] || 0) + 1;
          }
        });
      }
    });

    const topSkills = Object.entries(skillCountMap)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const reportData = {
      generatedAt: new Date().toISOString(),
      studentMetrics: {
        totalStudents,
        activeStudents,
        inactiveStudents,
        activePercentage
      },
      jobMetrics: {
        totalJobs,
        activeJobs,
        closedJobs,
        jobsByType,
        jobsByWorkMode
      },
      applicationMetrics: {
        totalApplications,
        applicationStatusDistribution,
        selectionRate
      },
      courseMetrics: {
        totalCourses,
        activeCourses,
        totalCourseStarts,
        totalCourseCompletions,
        courseCompletionRate
      },
      assessmentMetrics: {
        totalAssessmentsTaken,
        passedAssessments,
        assessmentPassRate,
        averageAssessmentScore,
        proficiencyDistribution
      },
      topSkills
    };

    res.status(200).json({
      success: true,
      data: reportData
    });
  } catch (error) {
    next(error);
  }
};
