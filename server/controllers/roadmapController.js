const mongoose = require('mongoose');
const LearningProgress = require('../models/LearningProgress');
const Profile = require('../models/Profile');
const Course = require('../models/Course');
const Job = require('../models/Job');
const {
  CAREER_ROLE_PRESETS,
  calculateJobMatch,
  generateRoadmap
} = require('../services/matchingService');

// @desc    Get student's personalized learning roadmap
// @route   GET /api/roadmap
// @access  Private (Student)
exports.getRoadmap = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI.');
    }

    const studentId = req.user._id;

    // Fetch existing roadmap steps for this student
    let steps = await LearningProgress.find({ studentId })
      .populate('recommendedCourses completedCourses')
      .sort({ stepNumber: 1, createdAt: 1 })
      .lean();

    // If student has no roadmap yet, automatically generate one based on missing skills
    if (steps.length === 0) {
      const profile = await Profile.findOne({ userId: studentId });
      const studentSkills = profile ? profile.skills : [];
      const targetRole = 'Full Stack MERN Developer';
      const roleRequirements = CAREER_ROLE_PRESETS[targetRole];

      const match = calculateJobMatch(studentSkills, roleRequirements);
      const activeCourses = await Course.find({ isActive: true }).lean();
      const generated = generateRoadmap(match.missingSkills, targetRole, activeCourses);

      // Persist generated roadmap steps to MongoDB
      for (const stepData of generated.steps) {
        await LearningProgress.findOneAndUpdate(
          { studentId, skill: stepData.skill },
          {
            studentId,
            skill: stepData.skill,
            targetRole,
            stepNumber: stepData.stepNumber,
            priority: stepData.priority,
            status: 'not-started',
            progressPercentage: 0,
            recommendedCourses: stepData.recommendedCourses.map((c) => c._id),
            lastUpdated: new Date()
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }

      // Re-fetch populated steps
      steps = await LearningProgress.find({ studentId })
        .populate('recommendedCourses completedCourses')
        .sort({ stepNumber: 1, createdAt: 1 })
        .lean();
    }

    const totalSteps = steps.length;
    const completedCount = steps.filter((s) => s.status === 'completed' || s.progressPercentage === 100).length;
    const inProgressCount = steps.filter((s) => s.status === 'in-progress' && s.progressPercentage < 100).length;
    const completionPercentage = totalSteps > 0
      ? Math.round((completedCount / totalSteps) * 100)
      : 0;

    const targetRole = steps[0]?.targetRole || 'Full Stack MERN Developer';

    res.status(200).json({
      success: true,
      data: {
        targetRole,
        totalSteps,
        completedCount,
        inProgressCount,
        completionPercentage,
        steps
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Initialize or customize student's learning roadmap for a role or job
// @route   POST /api/roadmap
// @access  Private (Student)
exports.createRoadmap = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI.');
    }

    const studentId = req.user._id;
    const { targetRole, jobId, customSkill, priority = 'Medium' } = req.body;

    // Single custom skill addition
    if (customSkill && customSkill.trim()) {
      const trimmedSkill = customSkill.trim();
      const existingStep = await LearningProgress.findOne({ studentId, skill: trimmedSkill });
      if (existingStep) {
        res.status(409);
        throw new Error(`Learning step for skill '${trimmedSkill}' already exists in your roadmap.`);
      }

      const count = await LearningProgress.countDocuments({ studentId });
      const newStep = await LearningProgress.create({
        studentId,
        skill: trimmedSkill,
        targetRole: targetRole || 'Custom Roadmap',
        stepNumber: count + 1,
        priority,
        status: 'not-started',
        progressPercentage: 0
      });

      return res.status(201).json({
        success: true,
        message: 'Custom learning step added to roadmap',
        data: newStep
      });
    }

    // Role or Job-based roadmap generation
    const profile = await Profile.findOne({ userId: studentId });
    const studentSkills = profile ? profile.skills : [];
    let requiredSkills = [];
    let roleTitle = targetRole || 'Full Stack MERN Developer';

    if (jobId) {
      const job = await Job.findById(jobId).lean();
      if (!job) {
        res.status(404);
        throw new Error('Target job for roadmap not found');
      }
      requiredSkills = job.requiredSkills || [];
      roleTitle = `${job.title} at ${job.company}`;
    } else {
      requiredSkills = CAREER_ROLE_PRESETS[roleTitle] || CAREER_ROLE_PRESETS['Full Stack MERN Developer'];
    }

    const match = calculateJobMatch(studentSkills, requiredSkills);
    const activeCourses = await Course.find({ isActive: true }).lean();
    const generated = generateRoadmap(match.missingSkills, roleTitle, activeCourses);

    // Replace or upsert student's roadmap steps
    await LearningProgress.deleteMany({ studentId });

    for (const stepData of generated.steps) {
      await LearningProgress.create({
        studentId,
        skill: stepData.skill,
        targetRole: roleTitle,
        stepNumber: stepData.stepNumber,
        priority: stepData.priority,
        status: 'not-started',
        progressPercentage: 0,
        recommendedCourses: stepData.recommendedCourses.map((c) => c._id),
        lastUpdated: new Date()
      });
    }

    const populatedSteps = await LearningProgress.find({ studentId })
      .populate('recommendedCourses')
      .sort({ stepNumber: 1 })
      .lean();

    res.status(201).json({
      success: true,
      message: `Personalized learning roadmap generated for ${roleTitle}`,
      data: {
        targetRole: roleTitle,
        totalSteps: populatedSteps.length,
        completionPercentage: 0,
        steps: populatedSteps
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update progress or status of a roadmap step
// @route   PUT /api/roadmap/:id
// @access  Private (Student)
exports.updateRoadmapStep = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI.');
    }

    const { id } = req.params;
    const { status, progressPercentage, notes, currentLevel, targetLevel } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid roadmap step ID');
    }

    const step = await LearningProgress.findById(id);
    if (!step) {
      res.status(404);
      throw new Error('Roadmap step not found');
    }

    // Strict ownership verification: student cannot modify another student's roadmap
    if (step.studentId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Access denied: You cannot modify another student’s roadmap.');
    }

    if (status) {
      if (!['not-started', 'in-progress', 'completed'].includes(status)) {
        res.status(400);
        throw new Error("Status must be 'not-started', 'in-progress', or 'completed'");
      }
      step.status = status;
      if (status === 'completed') {
        step.progressPercentage = 100;
      } else if (status === 'in-progress' && step.progressPercentage === 0) {
        step.progressPercentage = 50;
      } else if (status === 'not-started') {
        step.progressPercentage = 0;
      }
    }

    if (progressPercentage !== undefined) {
      const parsedPct = Number(progressPercentage);
      if (isNaN(parsedPct) || parsedPct < 0 || parsedPct > 100) {
        res.status(400);
        throw new Error('Progress percentage must be a number between 0 and 100');
      }
      step.progressPercentage = parsedPct;
      if (parsedPct === 100) step.status = 'completed';
      else if (parsedPct > 0) step.status = 'in-progress';
      else step.status = 'not-started';
    }

    if (notes !== undefined) step.notes = notes.trim();
    if (currentLevel) step.currentLevel = currentLevel;
    if (targetLevel) step.targetLevel = targetLevel;
    step.lastUpdated = new Date();

    await step.save();

    // If step was completed, sync the competency to student profile skills
    if (step.status === 'completed' || step.progressPercentage === 100) {
      try {
        const studentProfile = await Profile.findOne({
          $or: [{ userId: req.user._id }, { user: req.user._id }]
        });
        if (studentProfile) {
          if (!Array.isArray(studentProfile.skills)) studentProfile.skills = [];
          const stepSkillNorm = (step.skill || '').trim().toLowerCase();
          const alreadyExists = studentProfile.skills.some((s) => {
            const sName = (typeof s === 'string' ? s : s.name || s.skillName || '').trim().toLowerCase();
            return sName === stepSkillNorm;
          });
          if (!alreadyExists) {
            studentProfile.skills.push({
              name: step.skill,
              category: 'Technical Skills',
              proficiency: step.targetLevel || 'Intermediate'
            });
            await studentProfile.save();
          }
        }
      } catch (profErr) {
        // Non-blocking sync error
      }
    }

    // Recalculate student overall completion
    const allSteps = await LearningProgress.find({ studentId: req.user._id });
    const totalSteps = allSteps.length;
    const completedCount = allSteps.filter((s) => s.status === 'completed' || s.progressPercentage === 100).length;
    const completionPercentage = totalSteps > 0
      ? Math.round((completedCount / totalSteps) * 100)
      : 0;

    res.status(200).json({
      success: true,
      message: 'Roadmap step updated successfully',
      data: {
        step,
        completionPercentage,
        totalSteps,
        completedCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a roadmap step
// @route   DELETE /api/roadmap/:id
// @access  Private (Student)
exports.deleteRoadmapStep = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI.');
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid roadmap step ID');
    }

    const step = await LearningProgress.findById(id);
    if (!step) {
      res.status(404);
      throw new Error('Roadmap step not found');
    }

    // Strict ownership verification
    if (step.studentId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Access denied: You cannot delete another student’s roadmap step.');
    }

    await step.deleteOne();

    // Re-index remaining step numbers
    const remainingSteps = await LearningProgress.find({ studentId: req.user._id }).sort({ stepNumber: 1 });
    for (let i = 0; i < remainingSteps.length; i++) {
      remainingSteps[i].stepNumber = i + 1;
      await remainingSteps[i].save();
    }

    res.status(200).json({
      success: true,
      message: 'Roadmap step removed successfully'
    });
  } catch (error) {
    next(error);
  }
};
