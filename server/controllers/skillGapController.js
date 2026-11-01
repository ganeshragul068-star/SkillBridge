const mongoose = require('mongoose');
const Job = require('../models/Job');
const Profile = require('../models/Profile');
const Course = require('../models/Course');
const AssessmentResult = require('../models/AssessmentResult');
const LearningProgress = require('../models/LearningProgress');
const {
  CAREER_ROLE_PRESETS,
  calculateSkillGap,
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

/**
 * Helper to fetch verified skills for student from passed assessments and completed competencies
 */
const getStudentVerifiedSkills = async (studentId) => {
  try {
    const [passedResults, completedProgress] = await Promise.all([
      AssessmentResult.find({
        studentId,
        passed: true
      }).populate('assessmentId', 'skill'),
      LearningProgress.find({
        studentId,
        $or: [{ status: 'completed' }, { progressPercentage: 100 }]
      })
    ]);

    const verifiedSkills = [];
    passedResults.forEach((res) => {
      if (res.assessmentId && res.assessmentId.skill) {
        verifiedSkills.push(res.assessmentId.skill);
      }
    });

    completedProgress.forEach((cp) => {
      if (cp.skill) {
        verifiedSkills.push(cp.skill);
      }
    });

    return [...new Set(verifiedSkills)];
  } catch (err) {
    return [];
  }
};

// @desc    Get skill-gap analysis for a specific job
// @route   GET /api/skill-gap/jobs/:jobId
// @access  Private (Student)
exports.getJobSkillGap = async (req, res, next) => {
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
      throw new Error('Target job not found');
    }

    // Retrieve all student skills (profile + completed competencies)
    const studentSkills = await getStudentCompleteSkills(req.user._id);

    // Retrieve verified skills from assessments and completed competencies
    const verifiedSkills = await getStudentVerifiedSkills(req.user._id);

    // Calculate skill gap
    const skillGap = calculateSkillGap(
      studentSkills,
      job.requiredSkills,
      verifiedSkills,
      `${job.title} at ${job.company}`
    );

    // Fetch active courses to recommend for missing skills
    const missingSkillNames = skillGap.missingSkills.map((m) => m.name);
    const activeCourses = await Course.find({ isActive: true }).lean();
    const recommendedCourses = recommendCourses(missingSkillNames, activeCourses, 'Beginner');

    res.status(200).json({
      success: true,
      data: {
        job: {
          _id: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
          requiredSkills: job.requiredSkills
        },
        skillGap,
        recommendedCourses,
        hasMissingSkills: skillGap.missingSkills.length > 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get skill-gap analysis for a standardized career role
// @route   GET /api/skill-gap/role/:roleName
// @access  Private (Student)
exports.getRoleSkillGap = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI.');
    }

    const decodedRole = decodeURIComponent(req.params.roleName || 'Full Stack MERN Developer').trim();
    
    // Look up role in presets or default to Full Stack MERN Developer
    const roleRequirements = CAREER_ROLE_PRESETS[decodedRole] ||
      CAREER_ROLE_PRESETS['Full Stack MERN Developer'];

    // Retrieve all student skills (profile + completed competencies)
    const studentSkills = await getStudentCompleteSkills(req.user._id);

    // Retrieve verified skills from passed assessments
    const verifiedSkills = await getStudentVerifiedSkills(req.user._id);

    // Calculate gap
    const skillGap = calculateSkillGap(
      studentSkills,
      roleRequirements,
      verifiedSkills,
      decodedRole
    );

    // Fetch active courses to recommend
    const missingSkillNames = skillGap.missingSkills.map((m) => m.name);
    const activeCourses = await Course.find({ isActive: true }).lean();
    const recommendedCourses = recommendCourses(missingSkillNames, activeCourses, 'Beginner');

    res.status(200).json({
      success: true,
      data: {
        roleName: decodedRole,
        availableRoles: Object.keys(CAREER_ROLE_PRESETS),
        skillGap,
        recommendedCourses,
        totalRoles: Object.keys(CAREER_ROLE_PRESETS).length
      }
    });
  } catch (error) {
    next(error);
  }
};
