const mongoose = require('mongoose');
const Job = require('../models/Job');
const Profile = require('../models/Profile');
const LearningProgress = require('../models/LearningProgress');
const { calculateJobMatch } = require('../services/matchingService');

/**
 * Helper to fetch all acquired skills for student (Profile + Completed Roadmap Competencies)
 */
const getStudentCompleteSkills = async (studentId) => {
  try {
    const profile = await Profile.findOne({
      $or: [{ userId: studentId }, { user: studentId }]
    });
    const skillsList = profile && Array.isArray(profile.skills) ? [...profile.skills] : [];

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
            proficiency: p.currentLevel || 'Intermediate'
          });
        }
      }
    });

    return skillsList;
  } catch (err) {
    return [];
  }
};

// @desc    Get smart matched jobs for authenticated student
// @route   GET /api/matching/jobs
// @access  Private (Student)
exports.getMatchingJobs = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI.');
    }

    const { tier, search, sort = 'match' } = req.query;

    // Retrieve student skills including completed competencies
    const studentSkills = await getStudentCompleteSkills(req.user._id);

    // Query active, non-expired jobs
    const now = new Date();
    const query = {
      status: 'Active',
      $or: [
        { applicationDeadline: { $gte: now } },
        { applicationDeadline: null },
        { applicationDeadline: { $exists: false } }
      ]
    };

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$and = [
        {
          $or: [
            { title: searchRegex },
            { company: searchRegex },
            { requiredSkills: { $in: [searchRegex] } }
          ]
        }
      ];
    }

    const jobs = await Job.find(query).lean();

    // Calculate match metrics for each active job
    const matchedJobs = jobs.map((job) => {
      const matchMetrics = calculateJobMatch(studentSkills, job.requiredSkills);
      return {
        ...job,
        match: matchMetrics
      };
    });

    // Filter by match tier if specified
    let filteredJobs = matchedJobs;
    if (tier && ['Excellent', 'Good', 'Moderate', 'Low'].includes(tier)) {
      filteredJobs = matchedJobs.filter((j) => j.match.matchTier === tier);
    }

    // Sort jobs
    if (sort === 'match') {
      // Descending by match percentage
      filteredJobs.sort((a, b) => b.match.matchPercentage - a.match.matchPercentage);
    } else if (sort === 'deadline') {
      filteredJobs.sort((a, b) => new Date(a.applicationDeadline || 0) - new Date(b.applicationDeadline || 0));
    } else if (sort === 'newest') {
      filteredJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.status(200).json({
      success: true,
      count: filteredJobs.length,
      totalActiveJobs: jobs.length,
      studentSkillsCount: studentSkills.length,
      data: filteredJobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed match analysis for a single job
// @route   GET /api/matching/jobs/:jobId
// @access  Private (Student)
exports.getJobMatchById = async (req, res, next) => {
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
      throw new Error('Job opportunity not found');
    }

    const studentSkills = await getStudentCompleteSkills(req.user._id);

    const matchMetrics = calculateJobMatch(studentSkills, job.requiredSkills);

    res.status(200).json({
      success: true,
      data: {
        job,
        match: matchMetrics
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student overall employability & job-matching summary
// @route   GET /api/matching/summary
// @access  Private (Student)
exports.getMatchingSummary = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI.');
    }

    const studentSkills = await getStudentCompleteSkills(req.user._id);

    // Query active, non-expired jobs
    const now = new Date();
    const activeJobs = await Job.find({
      status: 'Active',
      $or: [
        { applicationDeadline: { $gte: now } },
        { applicationDeadline: null },
        { applicationDeadline: { $exists: false } }
      ]
    }).lean();

    const tierCounts = {
      Excellent: 0,
      Good: 0,
      Moderate: 0,
      Low: 0
    };

    let totalPercentage = 0;
    const skillDemands = {};
    const skillMatches = {};

    const evaluatedJobs = activeJobs.map((job) => {
      const match = calculateJobMatch(studentSkills, job.requiredSkills);
      tierCounts[match.matchTier] = (tierCounts[match.matchTier] || 0) + 1;
      totalPercentage += match.matchPercentage;

      match.matchedSkills.forEach((s) => {
        skillMatches[s] = (skillMatches[s] || 0) + 1;
      });

      match.missingSkills.forEach((s) => {
        skillDemands[s] = (skillDemands[s] || 0) + 1;
      });

      return {
        _id: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        jobType: job.jobType,
        applicationDeadline: job.applicationDeadline,
        match
      };
    });

    // Sort by match percentage desc
    evaluatedJobs.sort((a, b) => b.match.matchPercentage - a.match.matchPercentage);

    const averageMatchPercentage = activeJobs.length > 0
      ? Math.round(totalPercentage / activeJobs.length)
      : 0;

    // Extract top missing in-demand skills
    const topMissingSkills = Object.entries(skillDemands)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Extract top matched skills
    const topMatchedSkills = Object.entries(skillMatches)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    res.status(200).json({
      success: true,
      data: {
        totalActiveJobs: activeJobs.length,
        averageMatchPercentage,
        tierCounts,
        bestMatch: evaluatedJobs[0] || null,
        topThreeJobs: evaluatedJobs.slice(0, 3),
        topMissingSkills,
        topMatchedSkills,
        studentSkillsCount: studentSkills.length
      }
    });
  } catch (error) {
    next(error);
  }
};
