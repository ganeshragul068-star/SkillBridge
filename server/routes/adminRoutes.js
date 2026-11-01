const express = require('express');
const router = express.Router();

const {
  getAdminDashboardMetrics,
  getAdminStudents,
  getAdminStudentById,
  toggleStudentStatus,
  getAdminUsers,
  getAdminJobs,
  createAdminJob,
  updateAdminJob,
  deleteAdminJob,
  toggleJobStatus,
  getJobApplications,
  getAdminApplications,
  getAdminApplicationById,
  updateApplicationStatus,
  getAdminCourses,
  createAdminCourse,
  updateAdminCourse,
  deleteAdminCourse,
  toggleCourseStatus,
  getCourseProgress,
  getAdminActivityLogs,
  getAdminReports
} = require('../controllers/adminController');

const {
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getAssessmentStats,
  addQuestionToAssessment,
  updateQuestionInAssessment,
  deleteQuestionFromAssessment,
  toggleAssessmentStatus,
  getAdminAssessmentResults
} = require('../controllers/assessmentController');

const {
  createAdminMentor,
  updateAdminMentor,
  toggleAdminMentorStatus,
  deleteAdminMentor,
  getAdminMentorStats
} = require('../controllers/mentorController');

const {
  getAdminAllRequests
} = require('../controllers/mentorshipRequestController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Enforce authentication & admin authorization for all administrative endpoints
router.use(protect, authorize('admin'));

// 1. Dashboard Overview & Statistics
router.get('/dashboard', getAdminDashboardMetrics);

// 2. Comprehensive Analytics & Reports
router.get('/reports/summary', getAdminReports);
router.get('/reports', getAdminReports);

// 3. Platform Activity Logs
router.get('/activity-logs', getAdminActivityLogs);

// 4. Student Management
router.get('/students', getAdminStudents);
router.get('/students/:id', getAdminStudentById);
router.patch('/students/:id/toggle-status', toggleStudentStatus);
router.put('/students/:id/status', toggleStudentStatus);
router.get('/users', getAdminUsers);

// 5. Job & Internship Management
router.get('/jobs', getAdminJobs);
router.post('/jobs', createAdminJob);
router.put('/jobs/:id', updateAdminJob);
router.delete('/jobs/:id', deleteAdminJob);
router.patch('/jobs/:id/toggle-status', toggleJobStatus);
router.get('/jobs/:id/applications', getJobApplications);

// 6. Application Management
router.get('/applications', getAdminApplications);
router.get('/applications/:id', getAdminApplicationById);
router.put('/applications/:id/status', updateApplicationStatus);

// 7. Course Management
router.get('/courses', getAdminCourses);
router.post('/courses', createAdminCourse);
router.put('/courses/:id', updateAdminCourse);
router.delete('/courses/:id', deleteAdminCourse);
router.patch('/courses/:id/toggle-status', toggleCourseStatus);
router.get('/courses/:id/progress', getCourseProgress);

// 8. Assessment Management (Reusing Phase 7 Engine)
router.get('/assessments/stats', getAssessmentStats);
router.get('/assessments/results', getAdminAssessmentResults);
router.post('/assessments', createAssessment);
router.put('/assessments/:id', updateAssessment);
router.delete('/assessments/:id', deleteAssessment);
router.patch('/assessments/:id/toggle-status', toggleAssessmentStatus);
router.post('/assessments/:id/questions', addQuestionToAssessment);
router.put('/assessments/:id/questions/:questionId', updateQuestionInAssessment);
router.delete('/assessments/:id/questions/:questionId', deleteQuestionFromAssessment);

// 9. Mentor Management & Platform Mentorship Requests
router.get('/mentors/stats', getAdminMentorStats);
router.post('/mentors', createAdminMentor);
router.put('/mentors/:id', updateAdminMentor);
router.patch('/mentors/:id/toggle-status', toggleAdminMentorStatus);
router.patch('/mentors/:id/status', toggleAdminMentorStatus);
router.delete('/mentors/:id', deleteAdminMentor);
router.get('/mentorship-requests', getAdminAllRequests);

module.exports = router;
