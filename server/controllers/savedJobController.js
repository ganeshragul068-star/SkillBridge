const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');

// @desc    Save/bookmark a job
// @route   POST /api/saved-jobs/:jobId
// @access  Private (Student)
exports.saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    const existingSave = await SavedJob.findOne({
      studentId: req.user._id,
      jobId
    });

    if (existingSave) {
      res.status(409);
      throw new Error('Job is already saved in your bookmarks');
    }

    const savedJob = await SavedJob.create({
      studentId: req.user._id,
      jobId
    });

    const populated = await SavedJob.findById(savedJob._id).populate(
      'jobId',
      'title company location jobType workMode salary status'
    );

    res.status(201).json({
      success: true,
      message: 'Job bookmarked successfully',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all saved jobs for current student
// @route   GET /api/saved-jobs
// @access  Private (Student)
exports.getMySavedJobs = async (req, res, next) => {
  try {
    const savedJobs = await SavedJob.find({ studentId: req.user._id })
      .populate('jobId', 'title company location jobType workMode salary status applicationDeadline')
      .sort({ savedAt: -1 });

    res.status(200).json({
      success: true,
      count: savedJobs.length,
      data: savedJobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove job from bookmarks
// @route   DELETE /api/saved-jobs/:jobId
// @access  Private (Student)
exports.removeSavedJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const deleted = await SavedJob.findOneAndDelete({
      studentId: req.user._id,
      jobId
    });

    if (!deleted) {
      res.status(404);
      throw new Error('Saved job record not found in your bookmarks');
    }

    res.status(200).json({
      success: true,
      message: 'Job removed from bookmarks'
    });
  } catch (error) {
    next(error);
  }
};
