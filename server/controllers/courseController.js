const Course = require('../models/Course');

// @desc    Get all courses with optional filters
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
  try {
    const { skill, difficulty, search } = req.query;
    const query = { isActive: true };

    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    if (skill) {
      query.skillsCovered = { $in: [new RegExp(skill, 'i')] };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { provider: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new course recommendation
// @route   POST /api/courses
// @access  Private (Admin only)
exports.createCourse = async (req, res, next) => {
  try {
    const { title, provider, description, skillsCovered, difficulty, duration, courseUrl } = req.body;

    if (!title || !provider || !description) {
      res.status(400);
      throw new Error('Please provide title, provider, and description for the course');
    }

    const course = await Course.create({
      title: title.trim(),
      provider: provider.trim(),
      description,
      skillsCovered: Array.isArray(skillsCovered) ? skillsCovered : [],
      difficulty: difficulty || 'Beginner',
      duration: duration || 'Self-paced',
      courseUrl: courseUrl || ''
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private (Admin only)
exports.updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private (Admin only)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
