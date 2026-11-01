const mongoose = require('mongoose');
const Course = require('../models/Course');
const Job = require('../models/Job');
const Profile = require('../models/Profile');
const LearningProgress = require('../models/LearningProgress');
const {
  CAREER_ROLE_PRESETS,
  calculateJobMatch,
  recommendCourses
} = require('../services/matchingService');

/**
 * Helper to fetch all acquired skills for student (Profile + Completed Roadmap Competencies)
 */
const getStudentCompleteSkills = async (studentId) => {
  try {
    const profile = await Profile.findOne({
      $or: [{ userId: studentId }, { user: studentId }]
    });
    const skillsList = profile && Array.isArray(profile.skills) ? [...profile.skills] : [];

    // Include competencies marked completed in LearningProgress / Roadmap
    const completedProgress = await LearningProgress.find({
      studentId,
      $or: [{ status: 'completed' }, { progressPercentage: 100 }]
    });

    completedProgress.forEach((p) => {
      if (p.skill && p.skill.trim()) {
        const pSkillNorm = p.skill.trim().toLowerCase();
        const alreadyHas = skillsList.some((s) => {
          const sName = (typeof s === 'string' ? s : s.name || s.skillName || '').trim().toLowerCase();
          return sName === pSkillNorm;
        });
        if (!alreadyHas) {
          skillsList.push({
            name: p.skill.trim(),
            category: 'Technical Skills',
            proficiency: p.currentLevel || 'Intermediate',
            isVerified: true
          });
        }
      }
    });

    return skillsList;
  } catch (err) {
    return [];
  }
};

// @desc    Get personalized course recommendations for student's missing skills
// @route   GET /api/recommendations/courses
// @access  Private (Student)
exports.getCourseRecommendations = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI.');
    }

    const { role = 'Full Stack MERN Developer' } = req.query;

    const studentSkills = await getStudentCompleteSkills(req.user._id);

    // Standard requirements for target role
    const roleRequirements = CAREER_ROLE_PRESETS[role] || CAREER_ROLE_PRESETS['Full Stack MERN Developer'];
    const match = calculateJobMatch(studentSkills, roleRequirements);

    const activeCourses = await Course.find({ isActive: true }).lean();
    const recommendations = recommendCourses(match.missingSkills, activeCourses, 'Beginner');

    res.status(200).json({
      success: true,
      count: recommendations.length,
      targetRole: role,
      totalMissingSkills: match.missingSkills.length,
      missingSkills: match.missingSkills,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get course recommendations targeted for a specific job's missing skills
// @route   GET /api/recommendations/courses/:jobId
// @access  Private (Student)
exports.getJobCourseRecommendations = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI.');
    }

    const { jobId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      res.status(400);
      throw new Error('Invalid job ID format');
    }

    const job = await Job.findById(jobId).lean();
    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    const studentSkills = await getStudentCompleteSkills(req.user._id);

    const match = calculateJobMatch(studentSkills, job.requiredSkills);
    const activeCourses = await Course.find({ isActive: true }).lean();
    const recommendations = recommendCourses(match.missingSkills, activeCourses, 'Beginner');

    res.status(200).json({
      success: true,
      jobId: job._id,
      jobTitle: job.title,
      company: job.company,
      count: recommendations.length,
      missingSkills: match.missingSkills,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};
