/**
 * Centralized Error Handling Middleware
 * Gracefully handles Mongoose Validation, Duplicate Key (11000), CastError, and JWT Errors
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = `Resource with id '${err.value}' not found`;
  }

  // Mongoose Duplicate Key Error (e.g., unique email, duplicate job application)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value entered for ${field}. This record already exists.`;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Mongoose Buffering / Offline Timeout Error
  if (err.message && (err.message.includes('buffering timed out') || err.message.includes('topology was destroyed') || err.name === 'MongooseServerSelectionError')) {
    statusCode = 503;
    message = 'MongoDB connection is offline. Please configure your MongoDB Atlas connection string (MONGO_URI) in server/.env or ensure your MongoDB database is running.';
  }

  // JWT Token Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired, please log in again';
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;
