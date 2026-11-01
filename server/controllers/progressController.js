const mongoose = require('mongoose');
const LearningProgress = require('../models/LearningProgress');
const Course = require('../models/Course');
const AssessmentResult = require('../models/AssessmentResult');

// @desc    Get all learning progress records for current student
// @route   GET /api/progress
// @access  Private (Student)
exports.getProgress = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI.');
    }

    const progressList = await LearningProgress.find({ studentId: req.user._id })
      .populate('completedCourses', 'title provider duration difficulty courseUrl')
      .populate('startedCourses', 'title provider duration difficulty courseUrl')
      .populate('recommendedCourses', 'title provider duration difficulty courseUrl')
      .sort({ lastUpdated: -1 });

    res.status(200).json({
      success: true,
      count: progressList.length,
      data: progressList
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or initialize learning progress for a skill
// @route   POST /api/progress
// @access  Private (Student)
exports.createProgress = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI.');
    }

    const {
      skill,
      currentLevel = 'Beginner',
      targetLevel = 'Advanced',
      progressPercentage = 0,
      completedCourses = [],
      startedCourses = [],
      targetRole = 'Full Stack Development',
      priority = 'Medium'
    } = req.body;

    if (!skill || !skill.trim()) {
      res.status(400);
      throw new Error('Skill name is required to track learning progress');
    }

    // Check if progress already exists for this skill
    let progress = await LearningProgress.findOne({
      studentId: req.user._id,
      skill: { $regex: new RegExp(`^${skill.trim()}$`, 'i') }
    });

    if (progress) {
      res.status(409);
      throw new Error(`Learning progress for '${skill.trim()}' is already being tracked`);
    }

    // Find active courses matching this skill
    const matchingCourses = await Course.find({
      isActive: true,
      skillsCovered: { $regex: new RegExp(skill.trim(), 'i') }
    }).limit(3);

    progress = await LearningProgress.create({
      studentId: req.user._id,
      skill: skill.trim(),
      targetRole,
      priority,
      currentLevel,
      targetLevel,
      progressPercentage: Math.min(100, Math.max(0, parseInt(progressPercentage, 10) || 0)),
      completedCourses: Array.isArray(completedCourses) ? completedCourses : [],
      startedCourses: Array.isArray(startedCourses) ? startedCourses : [],
      recommendedCourses: matchingCourses.map((c) => c._id),
      lastUpdated: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Learning progress initialized',
      data: progress
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update learning progress (progress %, levels, course completion)
// @route   PUT /api/progress/:id
// @access  Private (Student)
exports.updateProgress = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI.');
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid progress record ID');
    }

    let progress = await LearningProgress.findById(id);
    if (!progress) {
      res.status(404);
      throw new Error('Learning progress record not found');
    }

    // Strict ownership verification: student cannot modify another student's progress
    if (progress.studentId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Access denied: You cannot modify another student’s learning progress');
    }

    const {
      currentLevel,
      targetLevel,
      progressPercentage,
      completedCourses,
      startedCourses,
      courseToComplete,
      courseToStart,
      notes,
      status
    } = req.body;

    if (currentLevel) progress.currentLevel = currentLevel;
    if (targetLevel) progress.targetLevel = targetLevel;
    if (status) progress.status = status;
    if (notes !== undefined) progress.notes = notes.trim();

    if (progressPercentage !== undefined) {
      const parsedPct = Number(progressPercentage);
      if (isNaN(parsedPct) || parsedPct < 0 || parsedPct > 100) {
        res.status(400);
        throw new Error('Progress percentage must be a valid number between 0 and 100.');
      }
      progress.progressPercentage = parsedPct;
      if (progress.progressPercentage === 100) {
        progress.status = 'completed';
        if (!progress.completedAt) progress.completedAt = new Date();
      } else if (progress.progressPercentage > 0) {
        progress.status = 'in-progress';
      }
    }

    if (!Array.isArray(progress.skillsGained)) {
      progress.skillsGained = [];
    }

    // Mark single course as started
    if (courseToStart && mongoose.Types.ObjectId.isValid(courseToStart)) {
      const courseIdStr = courseToStart.toString();
      if (!progress.startedCourses.some((c) => (c._id || c).toString() === courseIdStr)) {
        progress.startedCourses.push(courseToStart);
      }
    }

    // Mark single course as completed
    if (courseToComplete && mongoose.Types.ObjectId.isValid(courseToComplete)) {
      const courseIdStr = courseToComplete.toString();
      // Remove from started
      progress.startedCourses = progress.startedCourses.filter((c) => (c._id || c).toString() !== courseIdStr);
      // Add to completed if not already there
      if (!progress.completedCourses.some((c) => (c._id || c).toString() === courseIdStr)) {
        progress.completedCourses.push(courseToComplete);

        // Fetch course to record skills gained
        try {
          const courseDoc = await Course.findById(courseToComplete);
          if (courseDoc && Array.isArray(courseDoc.skillsCovered)) {
            courseDoc.skillsCovered.forEach((s) => {
              if (s && !progress.skillsGained.includes(s)) {
                progress.skillsGained.push(s);
              }
            });
          }
        } catch (_) {}
      }

      // If courses are completed, auto-update status and completion timestamp
      if (!progress.completedAt) {
        progress.completedAt = new Date();
      }
    }

    if (Array.isArray(completedCourses)) progress.completedCourses = completedCourses;
    if (Array.isArray(startedCourses)) progress.startedCourses = startedCourses;

    progress.lastUpdated = new Date();
    await progress.save();

    res.status(200).json({
      success: true,
      message: 'Learning progress updated',
      data: progress
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a learning progress record
// @route   DELETE /api/progress/:id
// @access  Private (Student)
exports.deleteProgress = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI.');
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid progress record ID');
    }

    const progress = await LearningProgress.findById(id);
    if (!progress) {
      res.status(404);
      throw new Error('Learning progress record not found');
    }

    // Strict ownership verification
    if (progress.studentId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Access denied: You cannot delete another student’s learning progress');
    }

    await progress.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Learning progress record removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregated learning progress & analytics dashboard metrics
// @route   GET /api/progress/dashboard
// @access  Private (Student)
exports.getProgressDashboard = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI.');
    }

    const studentId = req.user._id;

    // Fetch student's progress records
    const progressRecords = await LearningProgress.find({ studentId })
      .populate('completedCourses', 'title provider difficulty duration')
      .populate('startedCourses', 'title provider difficulty duration')
      .populate('recommendedCourses', 'title provider difficulty duration')
      .sort({ lastUpdated: -1 });

    // Fetch assessment results for performance trends
    const assessmentResults = await AssessmentResult.find({
      studentId,
      status: 'completed'
    })
      .populate('assessmentId', 'title skill category')
      .sort({ completedAt: -1 })
      .limit(10)
      .lean();

    const totalSkillsBeingLearned = progressRecords.length;

    // Set of unique completed course IDs
    const completedCourseMap = new Map();
    const startedCourseMap = new Map();

    let totalPct = 0;
    const skillsRequiringImprovement = [];

    progressRecords.forEach((p) => {
      totalPct += p.progressPercentage || 0;

      // Identify skills requiring improvement (progress < 60% or Needs Improvement assessment)
      if (p.progressPercentage < 60 || p.currentLevel === 'Beginner') {
        skillsRequiringImprovement.push({
          skill: p.skill,
          currentLevel: p.currentLevel,
          targetLevel: p.targetLevel,
          progressPercentage: p.progressPercentage
        });
      }

      (p.completedCourses || []).forEach((c) => {
        if (c && c._id) completedCourseMap.set(c._id.toString(), c);
      });

      (p.startedCourses || []).forEach((c) => {
        if (c && c._id) startedCourseMap.set(c._id.toString(), c);
      });
    });

    const overallLearningProgress = totalSkillsBeingLearned > 0
      ? Math.round(totalPct / totalSkillsBeingLearned)
      : 0;

    // Assessment trend scores
    const assessmentTrends = assessmentResults.map((r) => ({
      title: r.assessmentId?.title || 'Skill Assessment',
      skill: r.assessmentId?.skill || 'General',
      percentage: r.percentage,
      passed: r.passed,
      proficiencyLevel: r.proficiencyLevel,
      completedAt: r.completedAt
    }));

    res.status(200).json({
      success: true,
      data: {
        totalSkillsBeingLearned,
        coursesCompletedCount: completedCourseMap.size,
        coursesInProgressCount: startedCourseMap.size,
        overallLearningProgress,
        recentlyCompletedCourses: Array.from(completedCourseMap.values()).slice(0, 4),
        skillsRequiringImprovement,
        assessmentTrends,
        progressRecords
      }
    });
  } catch (error) {
    next(error);
  }
};
