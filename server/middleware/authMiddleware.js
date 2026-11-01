const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - verifies JWT from HTTP-only cookie or Authorization Bearer header
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Check HTTP-only cookie first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Fallback to Authorization: Bearer <token>
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token provided'));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'skillbridge_jwt_secret_dev_2026'
    );

    // Fetch user from DB, ensure active and exclude password
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401);
      throw new Error('User belonging to this session token no longer exists');
    }

    if (!user.isActive) {
      res.status(403);
      throw new Error('This user account has been deactivated');
    }

    req.user = user;
    return next();
  } catch (error) {
    res.status(401);
    return next(error);
  }
};

/**
 * Role-Based Access Control (RBAC) middleware
 * @param  {...string} roles Allowed roles ('admin', 'student')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error(`User role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to access this route`)
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
