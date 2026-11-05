const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const skillRoutes = require('./routes/skillRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const savedJobRoutes = require('./routes/savedJobRoutes');
const courseRoutes = require('./routes/courseRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const progressRoutes = require('./routes/progressRoutes');
const adminRoutes = require('./routes/adminRoutes');
const matchingRoutes = require('./routes/matchingRoutes');
const skillGapRoutes = require('./routes/skillGapRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const attemptRoutes = require('./routes/attemptRoutes');
const resultRoutes = require('./routes/resultRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const aiRoutes = require('./routes/aiRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const mentorshipRequestRoutes = require('./routes/mentorshipRequestRoutes');

// Data Mode Helper
const { isDemoMode, getDataMode } = require('./config/dataMode');

// Middleware Imports
const notFound = require('./middleware/notFoundMiddleware');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser Middleware
app.use(cookieParser());

// CORS Configuration with Credentials support
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Database Connection Guard Middleware for API routes (enforced only in MongoDB mode)
const mongoose = require('mongoose');
const checkDbConnection = (req, res, next) => {
  if (!isDemoMode() && mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'MongoDB database is not connected. Please set your MongoDB Atlas connection string (MONGO_URI) in server/.env or switch to DATA_MODE=demo.'
    });
  }
  next();
};

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    project: 'SkillBridge - Youth Employability Platform',
    version: '7.1.0',
    mode: getDataMode(),
    database: isDemoMode()
      ? 'demo-decoupled (JSON repository)'
      : (mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'),
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Apply DB connection guard to data endpoints
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  return checkDbConnection(req, res, next);
});

// REST API Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/saved-jobs', savedJobRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/assessment-attempts', attemptRoutes);
app.use('/api/assessment-results', resultRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/skill-gap', skillGapRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/mentorship-requests', mentorshipRequestRoutes);

// Serve static client assets in production / single-server mode if client/dist exists
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`🌐 [Frontend Ready]: Serving React SPA from ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  console.warn(`⚠️ [Frontend Missing]: client/dist folder not found at ${clientDistPath}`);
  console.warn('   Please run: npm --prefix client run build');
}

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
