const mongoose = require('mongoose');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Profile = require('../models/Profile');

// @desc    Submit a job application
// @route   POST /api/applications
// @access  Private (Student)
exports.applyForJob = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI in server/.env.');
    }

    const { jobId, resumeUrl, coverLetter, phone } = req.body;

    if (!jobId) {
      res.status(400);
      throw new Error('jobId is required to submit an application');
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      res.status(400);
      throw new Error('Invalid Job ID');
    }

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404);
      throw new Error('The requested job position does not exist');
    }

    // Verify job is open
    if (job.status === 'Closed') {
      res.status(400);
      throw new Error('This job position is closed and no longer accepting applications');
    }

    if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
      res.status(400);
      throw new Error('The application deadline for this position has passed');
    }

    // Check for duplicate application
    const existingApplication = await Application.findOne({
      studentId: req.user._id,
      jobId
    });

    if (existingApplication) {
      res.status(409);
      throw new Error('You have already submitted an application for this job opening');
    }

    // Fetch student profile snapshot
    const profile = await Profile.findOne({ userId: req.user._id });

    const application = await Application.create({
      studentId: req.user._id,
      jobId,
      studentName: req.user.name,
      studentEmail: req.user.email,
      phone: phone || profile?.phone || '',
      college: profile?.college || '',
      resumeUrl: (resumeUrl || '').trim(),
      coverLetter: (coverLetter || '').trim(),
      status: 'Applied',
      statusHistory: [
        {
          previousStatus: 'None',
          newStatus: 'Applied',
          changedBy: req.user._id,
          changedAt: new Date(),
          notes: 'Application submitted by student'
        }
      ]
    });

    const populatedApplication = await Application.findById(application._id)
      .populate('jobId', 'title company location jobType workMode salary applicationDeadline status')
      .populate('studentId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! Your application is now visible to campus recruiters.',
      data: populatedApplication
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications submitted by logged-in student
// @route   GET /api/applications/my
// @access  Private (Student)
exports.getMyApplications = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI in server/.env.');
    }

    const applications = await Application.find({ studentId: req.user._id })
      .populate('jobId', 'title company location jobType workMode salary applicationDeadline status')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private (Owner student or Admin)
exports.getApplicationById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(404);
      throw new Error('Invalid Application ID');
    }

    const application = await Application.findById(req.params.id)
      .populate('jobId', 'title company location jobType workMode salary description requiredSkills qualifications status')
      .populate('studentId', 'name email')
      .populate('statusHistory.changedBy', 'name role');

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    // Ownership check: must be the student applicant or an admin
    const applicantId = application.studentId._id
      ? application.studentId._id.toString()
      : application.studentId.toString();

    if (applicantId !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to access this application');
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw an application
// @route   PUT /api/applications/:id/withdraw
// @access  Private (Owner student)
exports.withdrawApplication = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(404);
      throw new Error('Invalid Application ID');
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    // Ownership check
    if (application.studentId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to withdraw this application');
    }

    if (application.status === 'Withdrawn') {
      res.status(400);
      throw new Error('This application has already been withdrawn');
    }

    const previousStatus = application.status;
    application.status = 'Withdrawn';
    application.statusHistory.push({
      previousStatus,
      newStatus: 'Withdrawn',
      changedBy: req.user._id,
      changedAt: new Date(),
      notes: 'Withdrawn by student'
    });

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully',
      data: application
    });
  } catch (error) {
    next(error);
  }
};
