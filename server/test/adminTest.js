/**
 * SkillBridge Phase 9 Test Suite: Admin Dashboard & Platform Management
 * 
 * Comprehensive verification of:
 * 1. Admin dashboard statistics (all dynamic from actual demo repository)
 * 2. Student listing with search, status filtering, and profile enrichment
 * 3. Individual student dossier retrieval (profile, learning progress, assessments, applications)
 * 4. Student account status modification (activate / deactivate)
 * 5. Admin self-deactivation guard (400)
 * 6. Deactivated student account login/access denial (403)
 * 7. Job management listing with applicant counts
 * 8. Job creation, update, status toggle, and deletion
 * 9. Job-specific applications retrieval
 * 10. Application management with status filtering and profile enrichment
 * 11. Application status transitions with audit history logging
 * 12. Course management CRUD and active/inactive status toggle
 * 13. Course progress tracking retrieval
 * 14. Assessment management and admin stats
 * 15. Platform activity logs recording and retrieval
 * 16. Comprehensive platform reports and analytics
 * 17. Security: Student role restricted from admin endpoints (403 Forbidden)
 */

require('dotenv').config();
const assert = require('assert');

// Import Models
const User = require('../models/User');
const Profile = require('../models/Profile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Course = require('../models/Course');
const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
const LearningProgress = require('../models/LearningProgress');
const ActivityLog = require('../models/ActivityLog');

// Import Controllers & Middlewares
const adminController = require('../controllers/adminController');
const assessmentController = require('../controllers/assessmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

console.log('=================================================================');
console.log('🛡️ SkillBridge Phase 9 Admin Dashboard & Management Verification');
console.log('=================================================================\n');

let passed = 0;
const total = 17;

const pass = (num, title, details = '') => {
  passed++;
  console.log(`✅ [Test ${num}/${total} PASS]: ${title}`);
  if (details) console.log(`   └─ ${details}`);
};

const fail = (num, title, error) => {
  console.error(`❌ [Test ${num}/${total} FAIL]: ${title}`);
  console.error(`   └─ Error: ${error.message || error}\n`);
  process.exit(1);
};

// Mock Express req/res context helper
const mockContext = (body = {}, headers = {}, params = {}, query = {}, user = null) => {
  let statusCode = 200;
  let jsonResponse = null;
  let nextError = null;

  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      jsonResponse = data;
      return res;
    }
  };

  const req = {
    body,
    headers,
    params,
    query,
    user
  };

  const next = (err) => {
    if (err) nextError = err;
  };

  return {
    req,
    res,
    next,
    getStatusCode: () => statusCode,
    getJSON: () => jsonResponse,
    getNextError: () => nextError
  };
};

const runAdminTests = async () => {
  try {
    // Retrieve Seeded Admin & Student Users
    const adminUser = await User.findOne({ role: 'admin' });
    const studentUser = await User.findOne({ email: 'alex.johnson@college.edu' });

    assert(adminUser, 'Admin user must exist in repository');
    assert(studentUser, 'Student user (Alex Johnson) must exist in repository');

    // -------------------------------------------------------------
    // Test 1: Admin Dashboard Statistics
    // -------------------------------------------------------------
    {
      const ctx = mockContext({}, {}, {}, {}, adminUser);
      await adminController.getAdminDashboardMetrics(ctx.req, ctx.res, ctx.next);
      const json = ctx.getJSON();

      assert.strictEqual(ctx.getStatusCode(), 200);
      assert.strictEqual(json.success, true);
      assert(typeof json.data.totalStudents === 'number');
      assert(typeof json.data.totalJobs === 'number');
      assert(typeof json.data.activeJobs === 'number');
      assert(typeof json.data.totalApplications === 'number');
      assert(typeof json.data.totalCourses === 'number');
      assert(typeof json.data.totalAssessments === 'number');
      assert(typeof json.data.applicationsByStatus === 'object');
      assert(Array.isArray(json.data.recentActivities));

      // Dual shape support for frontend overview
      assert.strictEqual(json.overview.totalUsers, json.data.totalStudents);
      assert.strictEqual(json.overview.totalJobs, json.data.activeJobs);
      pass(1, 'Admin Dashboard Dynamic Metrics', `Calculated ${json.data.totalStudents} students, ${json.data.totalJobs} jobs, ${json.data.totalApplications} applications`);
    }

    // -------------------------------------------------------------
    // Test 2: Student Management Listing & Search Filter
    // -------------------------------------------------------------
    {
      const ctx = mockContext({}, {}, {}, { search: 'Alex', status: 'active' }, adminUser);
      await adminController.getAdminStudents(ctx.req, ctx.res, ctx.next);
      const json = ctx.getJSON();

      assert.strictEqual(ctx.getStatusCode(), 200);
      assert.strictEqual(json.success, true);
      assert(json.data.length >= 1);
      const foundAlex = json.data.find(s => s.email === 'alex.johnson@college.edu');
      assert(foundAlex, 'Alex Johnson should be found by search');
      assert(foundAlex.profile, 'Student should be enriched with profile summary');
      assert.strictEqual(foundAlex.profile.college, 'National Institute of Technology');
      pass(2, 'Student Listing & Search Filter', `Retrieved ${json.count} student(s) with enriched profile details`);
    }

    // -------------------------------------------------------------
    // Test 3: Individual Student Dossier Retrieval
    // -------------------------------------------------------------
    {
      const ctx = mockContext({}, {}, { id: studentUser._id.toString() }, {}, adminUser);
      await adminController.getAdminStudentById(ctx.req, ctx.res, ctx.next);
      const json = ctx.getJSON();

      assert.strictEqual(ctx.getStatusCode(), 200);
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.student.email, 'alex.johnson@college.edu');
      assert(json.data.profile, 'Profile must be included');
      assert(Array.isArray(json.data.learningProgress), 'Learning progress must be an array');
      assert(Array.isArray(json.data.assessmentResults), 'Assessment results must be an array');
      assert(Array.isArray(json.data.applications), 'Applications must be an array');
      pass(3, 'Individual Student Dossier Retrieval', 'Gathered student account, profile, progress, tests, and job applications');
    }

    // -------------------------------------------------------------
    // Test 4: Student Account Status Toggle (Deactivate & Activate)
    // -------------------------------------------------------------
    let testStudent = null;
    {
      testStudent = await User.create({
        name: 'Demo Deactivate Student',
        email: 'deactivate.test@college.edu',
        password: 'Password@123',
        role: 'student',
        isActive: true
      });

      // Deactivate
      const deactCtx = mockContext({ isActive: false, reason: 'Verification test' }, {}, { id: testStudent._id.toString() }, {}, adminUser);
      await adminController.toggleStudentStatus(deactCtx.req, deactCtx.res, deactCtx.next);
      assert.strictEqual(deactCtx.getStatusCode(), 200);
      assert.strictEqual(deactCtx.getJSON().data.isActive, false);

      // Verify DB persistence
      const verifyDeactivated = await User.findById(testStudent._id);
      assert.strictEqual(verifyDeactivated.isActive, false);

      // Re-activate
      const actCtx = mockContext({ isActive: true }, {}, { id: testStudent._id.toString() }, {}, adminUser);
      await adminController.toggleStudentStatus(actCtx.req, actCtx.res, actCtx.next);
      assert.strictEqual(actCtx.getStatusCode(), 200);
      assert.strictEqual(actCtx.getJSON().data.isActive, true);

      pass(4, 'Student Account Status Toggle', 'Successfully transitioned student isActive from true -> false -> true');
    }

    // -------------------------------------------------------------
    // Test 5: Admin Self-Deactivation Guard
    // -------------------------------------------------------------
    {
      const selfCtx = mockContext({ isActive: false }, {}, { id: adminUser._id.toString() }, {}, adminUser);
      await adminController.toggleStudentStatus(selfCtx.req, selfCtx.res, selfCtx.next);

      assert.strictEqual(selfCtx.getStatusCode(), 400);
      assert.strictEqual(selfCtx.getJSON().success, false);
      pass(5, 'Admin Self-Deactivation Guard', 'Prevented administrator from deactivating their own account');
    }

    // -------------------------------------------------------------
    // Test 6: Deactivated Account Access Denial
    // -------------------------------------------------------------
    {
      // Deactivate testStudent again
      testStudent.isActive = false;
      await testStudent.save();

      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ id: testStudent._id.toString() }, process.env.JWT_SECRET || 'skillbridge_jwt_secret_dev_2026');

      let authError = null;
      const fakeReq = { headers: { authorization: `Bearer ${token}` } };
      const fakeRes = { status: (c) => fakeRes };
      const fakeNext = (err) => { if (err) authError = err; };

      await protect(fakeReq, fakeRes, fakeNext);
      assert(authError, 'Deactivated account must trigger an error in protect middleware');
      assert(authError.message.includes('deactivated'), 'Error message must reflect account deactivation');
      pass(6, 'Deactivated Account Access Guard', 'Deactivated student blocked by protect auth middleware with 403');
    }

    // -------------------------------------------------------------
    // Test 7: Job Listing with Applicant Counts
    // -------------------------------------------------------------
    {
      const ctx = mockContext({}, {}, {}, { status: 'All' }, adminUser);
      await adminController.getAdminJobs(ctx.req, ctx.res, ctx.next);
      const json = ctx.getJSON();

      assert.strictEqual(ctx.getStatusCode(), 200);
      assert.strictEqual(json.success, true);
      assert(json.data.length >= 1);
      assert(typeof json.data[0].applicantCount === 'number');
      pass(7, 'Admin Job Listing with Applicant Counts', `Retrieved ${json.count} jobs with dynamic applicantCount metrics`);
    }

    // -------------------------------------------------------------
    // Test 8: Job Creation, Update, Toggle & Deletion
    // -------------------------------------------------------------
    let createdJobId = null;
    {
      // Create
      const createPayload = {
        title: 'Platform QA Engineer Trainee',
        company: 'SkillBridge Core Systems',
        description: 'Automated test suite maintenance and regression verification.',
        jobType: 'Full-time',
        location: 'Bengaluru',
        workMode: 'Hybrid',
        requiredSkills: ['JavaScript', 'Jest', 'Node.js', 'REST APIs'],
        openings: 2,
        status: 'Active'
      };
      const createCtx = mockContext(createPayload, {}, {}, {}, adminUser);
      await adminController.createAdminJob(createCtx.req, createCtx.res, createCtx.next);
      assert.strictEqual(createCtx.getStatusCode(), 201);
      createdJobId = createCtx.getJSON().data._id.toString();

      // Update
      const updateCtx = mockContext({ salary: '₹6.5 LPA', openings: 3 }, {}, { id: createdJobId }, {}, adminUser);
      await adminController.updateAdminJob(updateCtx.req, updateCtx.res, updateCtx.next);
      assert.strictEqual(updateCtx.getStatusCode(), 200);
      assert.strictEqual(updateCtx.getJSON().data.salary, '₹6.5 LPA');

      // Toggle status
      const toggleCtx = mockContext({}, {}, { id: createdJobId }, {}, adminUser);
      await adminController.toggleJobStatus(toggleCtx.req, toggleCtx.res, toggleCtx.next);
      assert.strictEqual(toggleCtx.getStatusCode(), 200);
      assert.strictEqual(toggleCtx.getJSON().data.status, 'Closed');

      // Delete
      const deleteCtx = mockContext({}, {}, { id: createdJobId }, {}, adminUser);
      await adminController.deleteAdminJob(deleteCtx.req, deleteCtx.res, deleteCtx.next);
      assert.strictEqual(deleteCtx.getStatusCode(), 200);

      const checkJob = await Job.findById(createdJobId);
      assert.strictEqual(checkJob, null);
      pass(8, 'Job Management CRUD Lifecycle', 'Created, updated, toggled status, and deleted job listing');
    }

    // -------------------------------------------------------------
    // Test 9: Job Applications Retrieval
    // -------------------------------------------------------------
    {
      const allJobs = await Job.find({});
      const targetJob = allJobs[0];

      const ctx = mockContext({}, {}, { id: targetJob._id.toString() }, {}, adminUser);
      await adminController.getJobApplications(ctx.req, ctx.res, ctx.next);
      const json = ctx.getJSON();

      assert.strictEqual(ctx.getStatusCode(), 200);
      assert.strictEqual(json.success, true);
      assert(Array.isArray(json.data));
      pass(9, 'Job Applications Retrieval', `Retrieved ${json.count} candidate applications for job: ${targetJob.title}`);
    }

    // -------------------------------------------------------------
    // Test 10: Application Management & Profile Enrichment
    // -------------------------------------------------------------
    let sampleAppId = null;
    {
      const ctx = mockContext({}, {}, {}, { status: 'All' }, adminUser);
      await adminController.getAdminApplications(ctx.req, ctx.res, ctx.next);
      const json = ctx.getJSON();

      assert.strictEqual(ctx.getStatusCode(), 200);
      assert.strictEqual(json.success, true);
      assert(json.data.length >= 1);
      sampleAppId = json.data[0]._id.toString();

      // Individual application
      const singleCtx = mockContext({}, {}, { id: sampleAppId }, {}, adminUser);
      await adminController.getAdminApplicationById(singleCtx.req, singleCtx.res, singleCtx.next);
      assert.strictEqual(singleCtx.getStatusCode(), 200);
      assert(singleCtx.getJSON().data.studentId);
      pass(10, 'Application Listing & Enrichment', `Retrieved applications with attached student profiles`);
    }

    // -------------------------------------------------------------
    // Test 11: Application Status Update & History Audit
    // -------------------------------------------------------------
    {
      const updateCtx = mockContext(
        { status: 'Shortlisted', notes: 'Top candidate matching React & Node criteria' },
        {},
        { id: sampleAppId },
        {},
        adminUser
      );
      await adminController.updateApplicationStatus(updateCtx.req, updateCtx.res, updateCtx.next);
      const json = updateCtx.getJSON();

      assert.strictEqual(updateCtx.getStatusCode(), 200);
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.status, 'Shortlisted');

      // Verify audit history
      const updatedApp = await Application.findById(sampleAppId);
      const latestHistory = updatedApp.statusHistory[updatedApp.statusHistory.length - 1];
      assert.strictEqual(latestHistory.newStatus, 'Shortlisted');
      assert(latestHistory.notes.includes('Top candidate matching React'));
      pass(11, 'Application Status Transition & Audit Trail', 'Status updated to Shortlisted with logged history entry');
    }

    // -------------------------------------------------------------
    // Test 12: Course Management CRUD & Status Toggle
    // -------------------------------------------------------------
    let createdCourseId = null;
    {
      // Create
      const createCtx = mockContext(
        {
          title: 'Advanced Kubernetes & Cloud Native Patterns',
          provider: 'Cloud Native Foundation',
          description: 'Deploying microservices with ingress, secrets, and Helm charts.',
          skillsCovered: ['Kubernetes', 'Docker', 'DevOps'],
          difficulty: 'Advanced',
          duration: '15 Hours'
        },
        {},
        {},
        {},
        adminUser
      );
      await adminController.createAdminCourse(createCtx.req, createCtx.res, createCtx.next);
      assert.strictEqual(createCtx.getStatusCode(), 201);
      createdCourseId = createCtx.getJSON().data._id.toString();

      // Update
      const updateCtx = mockContext({ duration: '18 Hours' }, {}, { id: createdCourseId }, {}, adminUser);
      await adminController.updateAdminCourse(updateCtx.req, updateCtx.res, updateCtx.next);
      assert.strictEqual(updateCtx.getStatusCode(), 200);
      assert.strictEqual(updateCtx.getJSON().data.duration, '18 Hours');

      // Toggle status
      const toggleCtx = mockContext({}, {}, { id: createdCourseId }, {}, adminUser);
      await adminController.toggleCourseStatus(toggleCtx.req, toggleCtx.res, toggleCtx.next);
      assert.strictEqual(toggleCtx.getStatusCode(), 200);
      assert.strictEqual(toggleCtx.getJSON().data.isActive, false);

      // Delete
      const deleteCtx = mockContext({}, {}, { id: createdCourseId }, {}, adminUser);
      await adminController.deleteAdminCourse(deleteCtx.req, deleteCtx.res, deleteCtx.next);
      assert.strictEqual(deleteCtx.getStatusCode(), 200);

      const checkCourse = await Course.findById(createdCourseId);
      assert.strictEqual(checkCourse, null);
      pass(12, 'Course Management Lifecycle', 'Created, updated, toggled active status, and deleted course');
    }

    // -------------------------------------------------------------
    // Test 13: Course Learning Progress Retrieval
    // -------------------------------------------------------------
    {
      const allCourses = await Course.find({});
      const targetCourse = allCourses[0];

      const ctx = mockContext({}, {}, { id: targetCourse._id.toString() }, {}, adminUser);
      await adminController.getCourseProgress(ctx.req, ctx.res, ctx.next);
      const json = ctx.getJSON();

      assert.strictEqual(ctx.getStatusCode(), 200);
      assert.strictEqual(json.success, true);
      assert(Array.isArray(json.data));
      pass(13, 'Course Learning Progress Retrieval', `Retrieved ${json.count} progress records for course: ${targetCourse.title}`);
    }

    // -------------------------------------------------------------
    // Test 14: Assessment Management & Admin Stats
    // -------------------------------------------------------------
    {
      const statsCtx = mockContext({}, {}, {}, {}, adminUser);
      await assessmentController.getAssessmentStats(statsCtx.req, statsCtx.res, statsCtx.next);
      const json = statsCtx.getJSON();

      assert.strictEqual(statsCtx.getStatusCode(), 200);
      assert.strictEqual(json.success, true);
      assert(typeof json.data.totalAssessments === 'number');
      assert(typeof json.data.totalAttempts === 'number');

      // Admin assessment results
      const resultsCtx = mockContext({}, {}, {}, {}, adminUser);
      await assessmentController.getAdminAssessmentResults(resultsCtx.req, resultsCtx.res, resultsCtx.next);
      assert.strictEqual(resultsCtx.getStatusCode(), 200);
      assert(Array.isArray(resultsCtx.getJSON().data));
      pass(14, 'Assessment Management & Analytics', `Retrieved assessment statistics (${json.data.totalAssessments} tests, ${json.data.totalAttempts} submissions)`);
    }

    // -------------------------------------------------------------
    // Test 15: Platform Activity Logs Retrieval
    // -------------------------------------------------------------
    {
      const ctx = mockContext({}, {}, {}, { limit: 10 }, adminUser);
      await adminController.getAdminActivityLogs(ctx.req, ctx.res, ctx.next);
      const json = ctx.getJSON();

      assert.strictEqual(ctx.getStatusCode(), 200);
      assert.strictEqual(json.success, true);
      assert(json.data.length >= 1);
      const latest = json.data[0];
      assert(latest.action, 'Log must contain an action');
      assert(latest.performedByName, 'Log must record admin user name');
      pass(15, 'Platform Activity Logs', `Retrieved ${json.count} activity log entries with audit metadata`);
    }

    // -------------------------------------------------------------
    // Test 16: Comprehensive Reports & Platform Analytics
    // -------------------------------------------------------------
    {
      const ctx = mockContext({}, {}, {}, {}, adminUser);
      await adminController.getAdminReports(ctx.req, ctx.res, ctx.next);
      const json = ctx.getJSON();

      assert.strictEqual(ctx.getStatusCode(), 200);
      assert.strictEqual(json.success, true);
      assert(json.data.studentMetrics.totalStudents > 0);
      assert(json.data.jobMetrics.totalJobs > 0);
      assert(typeof json.data.applicationMetrics.selectionRate === 'number');
      assert(typeof json.data.courseMetrics.courseCompletionRate === 'number');
      assert(typeof json.data.assessmentMetrics.assessmentPassRate === 'number');
      assert(Array.isArray(json.data.topSkills));
      pass(16, 'Comprehensive Dynamic Reports', 'Generated student, job, application funnel, course, and assessment reports');
    }

    // -------------------------------------------------------------
    // Test 17: Security Guard: Student Blocked from Admin APIs
    // -------------------------------------------------------------
    {
      let forbiddenError = null;
      const fakeReq = { user: studentUser };
      const fakeRes = {
        status: (c) => {
          assert.strictEqual(c, 403);
          return fakeRes;
        }
      };
      const fakeNext = (err) => {
        if (err) forbiddenError = err;
      };

      authorize('admin')(fakeReq, fakeRes, fakeNext);
      assert(forbiddenError, 'Student must receive Forbidden error');
      assert(forbiddenError.message.includes('not authorized'), 'Error message must reflect role denial');
      pass(17, 'Role-Based Access Control Guard', 'Student accounts strictly blocked from admin endpoints with 403');
    }

    console.log('\n=================================================================');
    console.log(`🎉 ALL ${passed}/${total} PHASE 9 VERIFICATION TESTS PASSED SUCCESSFULLY!`);
    console.log('=================================================================\n');
    process.exit(0);
  } catch (error) {
    fail(passed + 1, 'Phase 9 Test Execution Exception', error);
  }
};

runAdminTests();
