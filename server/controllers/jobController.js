const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const Profile = require('../models/Profile');
const User = require('../models/User');

// Helper to optionally extract authenticated user from cookies or header without throwing
const getOptionalUser = async (req) => {
  let token;
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'skillbridge_jwt_secret_dev_2026');
    return await User.findById(decoded.id).select('_id role');
  } catch (_) {
    return null;
  }
};

// @desc    Get all jobs & internships with search, filters, sorting and pagination
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI in server/.env.');
    }

    const {
      search,
      jobType,
      workMode,
      location,
      status,
      skill,
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // Filter by status (default to 'Active' unless explicitly querying 'All' or 'Closed')
    if (status && status !== 'All') {
      query.status = status;
    } else if (!status) {
      query.status = 'Active';
    }

    if (jobType && jobType !== 'All') {
      query.jobType = jobType;
    }

    if (workMode && workMode !== 'All') {
      query.workMode = workMode;
    }

    if (location && location.trim()) {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    if (skill && skill.trim()) {
      query.requiredSkills = { $in: [new RegExp(skill.trim(), 'i')] };
    }

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(q, 'i')] } }
      ];
    }

    // Determine sort order
    let sortOptions = { createdAt: -1 };
    if (sort === 'deadline') {
      sortOptions = { applicationDeadline: 1, createdAt: -1 };
    } else if (sort === 'openings') {
      sortOptions = { openings: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('createdBy', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // If caller is authenticated student, annotate with isSaved and hasApplied
    const user = await getOptionalUser(req);
    let annotatedJobs = jobs;

    if (user && user.role === 'student') {
      const jobIds = jobs.map((j) => j._id);
      const [appliedList, savedList] = await Promise.all([
        Application.find({ studentId: user._id, jobId: { $in: jobIds } }).select('jobId status'),
        SavedJob.find({ studentId: user._id, jobId: { $in: jobIds } }).select('jobId')
      ]);

      const appliedMap = new Map();
      appliedList.forEach((a) => appliedMap.set(a.jobId.toString(), a.status));
      const savedSet = new Set(savedList.map((s) => s.jobId.toString()));

      annotatedJobs = jobs.map((j) => {
        const obj = j.toObject();
        obj.hasApplied = appliedMap.has(j._id.toString());
        obj.applicationStatus = appliedMap.get(j._id.toString()) || null;
        obj.isSaved = savedSet.has(j._id.toString());
        return obj;
      });
    }

    res.status(200).json({
      success: true,
      count: annotatedJobs.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: annotatedJobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID with applied status & similar opportunities
// @route   GET /api/jobs/:id
// @access  Public
exports.getJobById = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI in server/.env.');
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(404);
      throw new Error('Invalid Job ID');
    }

    const job = await Job.findById(req.params.id).populate('createdBy', 'name email');

    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    const user = await getOptionalUser(req);
    let hasApplied = false;
    let applicationDetails = null;
    let isSaved = false;

    if (user && user.role === 'student') {
      const [app, saved] = await Promise.all([
        Application.findOne({ studentId: user._id, jobId: job._id }),
        SavedJob.findOne({ studentId: user._id, jobId: job._id })
      ]);
      if (app) {
        hasApplied = true;
        applicationDetails = {
          _id: app._id,
          status: app.status,
          appliedAt: app.appliedAt
        };
      }
      if (saved) isSaved = true;
    }

    // Similar opportunities (matching jobType or requiredSkills, excluding current)
    const similarJobs = await Job.find({
      _id: { $ne: job._id },
      status: 'Active',
      $or: [
        { requiredSkills: { $in: job.requiredSkills || [] } },
        { jobType: job.jobType }
      ]
    })
      .select('title company location jobType workMode salary applicationDeadline')
      .limit(3);

    const jobObj = job.toObject();
    jobObj.hasApplied = hasApplied;
    jobObj.applicationDetails = applicationDetails;
    jobObj.isSaved = isSaved;
    jobObj.isExpired = !job.isOpenForApplications();

    res.status(200).json({
      success: true,
      data: jobObj,
      similarJobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (Admin only)
exports.createJob = async (req, res, next) => {
  try {
    const {
      title,
      company,
      companyLogo,
      description,
      responsibilities,
      jobType,
      location,
      workMode,
      requiredSkills,
      preferredSkills,
      qualifications,
      experience,
      salary,
      applicationDeadline,
      openings,
      status
    } = req.body;

    if (!title || !company || !description || !location) {
      res.status(400);
      throw new Error('Please provide title, company, description, and location');
    }

    // Process array helpers from comma strings if needed
    const normalizeArray = (val) => {
      if (Array.isArray(val)) return val.map((s) => s.trim()).filter(Boolean);
      if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean);
      return [];
    };

    const job = await Job.create({
      title: title.trim(),
      company: company.trim(),
      companyLogo: (companyLogo || '').trim(),
      description: description.trim(),
      responsibilities: normalizeArray(responsibilities),
      jobType: jobType || 'Internship',
      location: location.trim(),
      workMode: workMode || 'Remote',
      requiredSkills: normalizeArray(requiredSkills),
      preferredSkills: normalizeArray(preferredSkills),
      qualifications: normalizeArray(qualifications),
      experience: experience || 'Fresher / Entry Level',
      salary: salary || 'Stipend / Disclosed upon interview',
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
      openings: openings ? Math.max(1, parseInt(openings, 10)) : 1,
      status: status || 'Active',
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Job posting created successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job posting
// @route   PUT /api/jobs/:id
// @access  Private (Admin only)
exports.updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    const normalizeArray = (val) => {
      if (Array.isArray(val)) return val.map((s) => s.trim()).filter(Boolean);
      if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean);
      return [];
    };

    const updates = { ...req.body };
    if (updates.requiredSkills !== undefined) updates.requiredSkills = normalizeArray(updates.requiredSkills);
    if (updates.preferredSkills !== undefined) updates.preferredSkills = normalizeArray(updates.preferredSkills);
    if (updates.responsibilities !== undefined) updates.responsibilities = normalizeArray(updates.responsibilities);
    if (updates.qualifications !== undefined) updates.qualifications = normalizeArray(updates.qualifications);
    if (updates.applicationDeadline) updates.applicationDeadline = new Date(updates.applicationDeadline);

    job = await Job.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Job posting updated successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Admin only)
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    // Cascade delete associated saved jobs and applications
    await Promise.all([
      job.deleteOne(),
      SavedJob.deleteMany({ jobId: req.params.id }),
      Application.deleteMany({ jobId: req.params.id })
    ]);

    res.status(200).json({
      success: true,
      message: 'Job posting and associated applications removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommended jobs matching student skills
// @route   GET /api/jobs/recommended
// @access  Private (Student)
exports.getRecommendedJobs = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    const studentSkillNames = profile?.skills?.map((s) => s.name) || [];

    let query = { status: 'Active' };
    if (studentSkillNames.length > 0) {
      query.requiredSkills = { $in: studentSkillNames.map((s) => new RegExp(s, 'i')) };
    }

    const recommended = await Job.find(query)
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      count: recommended.length,
      data: recommended
    });
  } catch (error) {
    next(error);
  }
};
