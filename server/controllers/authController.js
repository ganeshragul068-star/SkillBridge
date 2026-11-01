const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');

/**
 * Generate signed JWT Token
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'skillbridge_jwt_secret_dev_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

/**
 * Helper to set HTTP-only cookie and return standard JSON response
 */
const sendTokenResponse = async (user, statusCode, res, message) => {
  const token = generateToken(user._id);

  // Cookie options: HTTP-only for security, lax SameSite, secure in production
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  };

  res.cookie('token', token, cookieOptions);

  // Fetch student profile if user is student
  let profile = null;
  if (user.role === 'student') {
    profile = await Profile.findOne({ userId: user._id });
  }

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      profile: profile || null,
      token // Provided for dual support (browser cookies & Authorization Bearer header)
    }
  });
};

// @desc    Register a new student account
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      college,
      department,
      degree,
      graduationYear
    } = req.body;

    // Validate all required fields
    if (!name || !email || !password || !college || !department || !graduationYear) {
      res.status(400);
      throw new Error('Please fill in all required fields: name, email, password, college, department, and graduation year');
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    if (!emailRegex.test(email.trim())) {
      res.status(400);
      throw new Error('Please provide a valid email address');
    }

    // Validate password security
    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters long');
    }

    // Validate password confirmation if provided
    if (confirmPassword !== undefined && password !== confirmPassword) {
      res.status(400);
      throw new Error('Passwords do not match');
    }

    // Check whether database is connected
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('MongoDB database is offline. Please configure your MongoDB Atlas connection string (MONGO_URI) in server/.env or start local MongoDB.');
    }

    // Check whether the email already exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      res.status(409);
      throw new Error('An account with this email address already exists. Please log in.');
    }

    // Automatically assign student role (never allow selecting admin role)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'student'
    });

    // Create corresponding Profile document
    const parsedGradYear = parseInt(graduationYear, 10);
    await Profile.create({
      userId: user._id,
      college: college.trim(),
      department: department.trim(),
      degree: (degree && degree.trim()) || 'B.Tech / Bachelor Degree',
      graduationYear: isNaN(parsedGradYear) ? 2026 : parsedGradYear,
      skills: []
    });

    await sendTokenResponse(user, 201, res, 'Student account registered successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get session token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    // Check whether database is connected
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('MongoDB database is offline. Please configure your MongoDB Atlas connection string (MONGO_URI) in server/.env or start local MongoDB.');
    }

    // Fetch user including password
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      res.status(403);
      throw new Error('Account is deactivated. Please contact administrator.');
    }

    await sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged-in user profile & authentication session
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    let profile = null;
    if (user.role === 'student') {
      profile = await Profile.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        profile: profile || null
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & clear authentication cookie
// @route   POST /api/auth/logout
// @access  Public / Private
exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};
