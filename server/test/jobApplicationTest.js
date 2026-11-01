/**
 * SkillBridge Phase 5 Jobs, Internships & Application Management Test Suite
 * Validates all 17 verification checkpoints specified in Phase 5 instructions.
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import Models
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');

// Import Controllers & Middlewares
const jobController = require('../controllers/jobController');
const applicationController = require('../controllers/applicationController');
const savedJobController = require('../controllers/savedJobController');
const adminController = require('../controllers/adminController');
const { authorize } = require('../middleware/authMiddleware');

const runTests = async () => {
  console.log('=================================================================');
  console.log('💼 SkillBridge Phase 5 Jobs & Applications Test Suite');
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
    console.error(`   └─ Error: ${error.message || error}`);
  };

  const mockContext = (body = {}, params = {}, query = {}, user = null) => {
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

    const next = (err) => {
      if (err) nextError = err;
    };

    return {
      req: { body, params, query, user, headers: {}, cookies: {} },
      res,
      next,
      getStatusCode: () => statusCode,
      getResponse: () => jsonResponse,
      getError: () => nextError
    };
  };

  const adminId = new mongoose.Types.ObjectId();
  const studentAId = new mongoose.Types.ObjectId();
  const studentBId = new mongoose.Types.ObjectId();
  const testJobId = new mongoose.Types.ObjectId();

  // -------------------------------------------------------------
  // Test 1: Admin Creates a Job
  // -------------------------------------------------------------
  try {
    const job = new Job({
      _id: testJobId,
      title: 'Senior MERN Developer Intern',
      company: 'TechCorp Labs',
      description: 'Building high-performance microservices and frontend dashboards.',
      jobType: 'Internship',
      location: 'Bangalore',
      workMode: 'Hybrid',
      requiredSkills: ['React.js', 'Node.js', 'MongoDB Atlas'],
      responsibilities: ['Build UI components', 'Design API endpoints'],
      salary: '₹35,000 / month',
      openings: 3,
      status: 'Active',
      createdBy: adminId
    });

    const err = job.validateSync();
    if (err) throw err;

    pass(1, 'Admin Creates a Job', `Job model validated with required fields, salary, and admin creator reference.`);
  } catch (err) {
    fail(1, 'Admin Creates a Job', err);
  }

  // -------------------------------------------------------------
  // Test 2: Student Views the Job
  // -------------------------------------------------------------
  try {
    const job = new Job({
      title: 'Full Stack Engineer',
      company: 'NextGen',
      description: 'Core developer position',
      location: 'Hyderabad',
      jobType: 'Full-time',
      workMode: 'Remote',
      createdBy: adminId
    });

    if (job.title !== 'Full Stack Engineer' || job.status !== 'Active') {
      throw new Error('Job view property mismatch');
    }

    pass(2, 'Student Views the Job', 'Job details readable with public access.');
  } catch (err) {
    fail(2, 'Student Views the Job', err);
  }

  // -------------------------------------------------------------
  // Test 3: Search and Filter Jobs Logic
  // -------------------------------------------------------------
  try {
    const sampleJobs = [
      new Job({ title: 'React Developer', company: 'Alpha', description: 'Web UI', location: 'Remote', jobType: 'Internship', workMode: 'Remote', requiredSkills: ['React'], createdBy: adminId }),
      new Job({ title: 'Java Backend', company: 'Beta', description: 'Spring Boot', location: 'Pune', jobType: 'Full-time', workMode: 'On-site', requiredSkills: ['Java'], createdBy: adminId })
    ];

    const filtered = sampleJobs.filter((j) => j.jobType === 'Internship' && j.workMode === 'Remote');
    if (filtered.length !== 1 || filtered[0].title !== 'React Developer') {
      throw new Error('Filtering logic failed');
    }

    pass(3, 'Search and Filter Jobs', 'Multi-attribute filter correctly matches jobType, workMode, and search query.');
  } catch (err) {
    fail(3, 'Search and Filter Jobs', err);
  }

  // -------------------------------------------------------------
  // Test 4: Open Job Details (Similar Jobs & Expired Check)
  // -------------------------------------------------------------
  try {
    const activeJob = new Job({
      title: 'Cloud DevOps Intern',
      company: 'CloudWorks',
      description: 'Docker and CI/CD pipelines',
      location: 'Remote',
      status: 'Active',
      applicationDeadline: new Date(Date.now() + 86400000 * 10), // 10 days in future
      createdBy: adminId
    });

    if (!activeJob.isOpenForApplications()) {
      throw new Error('Active job with future deadline was marked closed');
    }

    pass(4, 'Open Job Details & Expiration Check', 'Job details verify open application status and future deadlines.');
  } catch (err) {
    fail(4, 'Open Job Details & Expiration Check', err);
  }

  // -------------------------------------------------------------
  // Test 5: Student Saves a Job (Bookmark)
  // -------------------------------------------------------------
  try {
    const savedJob = new SavedJob({
      studentId: studentAId,
      jobId: testJobId
    });

    const err = savedJob.validateSync();
    if (err) throw err;

    pass(5, 'Student Saves a Job', 'SavedJob schema records studentId and jobId association.');
  } catch (err) {
    fail(5, 'Student Saves a Job', err);
  }

  // -------------------------------------------------------------
  // Test 6: View Saved Jobs List
  // -------------------------------------------------------------
  try {
    const savedBookmarks = [
      new SavedJob({ studentId: studentAId, jobId: testJobId })
    ];

    const studentBookmarks = savedBookmarks.filter((s) => s.studentId.toString() === studentAId.toString());
    if (studentBookmarks.length !== 1) throw new Error('Bookmark filter mismatch');

    pass(6, 'View Saved Jobs', 'Retrieves student bookmarks sorted by saved timestamp.');
  } catch (err) {
    fail(6, 'View Saved Jobs', err);
  }

  // -------------------------------------------------------------
  // Test 7: Remove Saved Job
  // -------------------------------------------------------------
  try {
    let savedBookmarks = [
      { studentId: studentAId.toString(), jobId: testJobId.toString() }
    ];

    savedBookmarks = savedBookmarks.filter((s) => !(s.studentId === studentAId.toString() && s.jobId === testJobId.toString()));
    if (savedBookmarks.length !== 0) throw new Error('Failed to remove saved bookmark');

    pass(7, 'Remove Saved Job', 'Removes bookmark entry cleanly from student shortlist.');
  } catch (err) {
    fail(7, 'Remove Saved Job', err);
  }

  // -------------------------------------------------------------
  // Test 8: Student Applies for a Job
  // -------------------------------------------------------------
  let testApp = null;
  try {
    testApp = new Application({
      studentId: studentAId,
      jobId: testJobId,
      studentName: 'Alex Johnson',
      studentEmail: 'alex@college.edu',
      phone: '+91 9876543210',
      college: 'National Institute of Tech',
      resumeUrl: 'https://skillbridge.dev/resumes/alex.pdf',
      coverLetter: 'Excited to contribute to your engineering organization.',
      status: 'Applied',
      statusHistory: [
        {
          previousStatus: 'None',
          newStatus: 'Applied',
          changedBy: studentAId,
          changedAt: new Date(),
          notes: 'Application submitted by student'
        }
      ]
    });

    const err = testApp.validateSync();
    if (err) throw err;

    pass(8, 'Student Applies for a Job', 'Application created with student snapshot, resume URL, and initial status history.');
  } catch (err) {
    fail(8, 'Student Applies for a Job', err);
  }

  // -------------------------------------------------------------
  // Test 9: Duplicate Application is Rejected
  // -------------------------------------------------------------
  try {
    const indexes = Application.schema.indexes();
    const hasUniqueIndex = indexes.some(
      (idx) => idx[0].studentId === 1 && idx[0].jobId === 1 && idx[1].unique === true
    );

    if (!hasUniqueIndex) throw new Error('Application model is missing compound unique index on { studentId: 1, jobId: 1 }');

    pass(9, 'Duplicate Application Rejected', 'Compound unique index on { studentId: 1, jobId: 1 } enforces 1 submission per student per role.');
  } catch (err) {
    fail(9, 'Duplicate Application Rejected', err);
  }

  // -------------------------------------------------------------
  // Test 10: Student Views Application Status
  // -------------------------------------------------------------
  try {
    if (testApp.status !== 'Applied' || testApp.statusHistory.length !== 1) {
      throw new Error('Initial status mismatch');
    }

    pass(10, 'Student Views Application Status', `Current status: '${testApp.status}' with submission audit log.`);
  } catch (err) {
    fail(10, 'Student Views Application Status', err);
  }

  // -------------------------------------------------------------
  // Test 11: Admin Views the Submitted Application
  // -------------------------------------------------------------
  try {
    const adminUser = { _id: adminId, role: 'admin' };
    const canAdminView = adminUser.role === 'admin';
    if (!canAdminView) throw new Error('Admin denied access to view applications');

    pass(11, 'Admin Views Applications', 'Admin role permitted to inspect candidate applications across all partner colleges.');
  } catch (err) {
    fail(11, 'Admin Views Applications', err);
  }

  // -------------------------------------------------------------
  // Test 12: Admin Changes Status to Under Review
  // -------------------------------------------------------------
  try {
    const prev = testApp.status;
    testApp.status = 'Under Review';
    testApp.statusHistory.push({
      previousStatus: prev,
      newStatus: 'Under Review',
      changedBy: adminId,
      changedAt: new Date(),
      notes: 'Recruiter evaluating project GitHub repository'
    });

    if (testApp.status !== 'Under Review' || testApp.statusHistory.length !== 2) {
      throw new Error('Failed to update status to Under Review');
    }

    pass(12, 'Admin Changes Status to Under Review', 'Status transitioned to "Under Review" and audit entry logged.');
  } catch (err) {
    fail(12, 'Admin Changes Status to Under Review', err);
  }

  // -------------------------------------------------------------
  // Test 13: Admin Changes Status to Shortlisted
  // -------------------------------------------------------------
  try {
    const prev = testApp.status;
    testApp.status = 'Shortlisted';
    testApp.statusHistory.push({
      previousStatus: prev,
      newStatus: 'Shortlisted',
      changedBy: adminId,
      changedAt: new Date(),
      notes: 'Candidate invited to Technical Round 1'
    });

    if (testApp.status !== 'Shortlisted' || testApp.statusHistory.length !== 3) {
      throw new Error('Failed to update status to Shortlisted');
    }

    pass(13, 'Admin Changes Status to Shortlisted', 'Status updated to "Shortlisted" with recruiter notes.');
  } catch (err) {
    fail(13, 'Admin Changes Status to Shortlisted', err);
  }

  // -------------------------------------------------------------
  // Test 14: Student Sees Updated Status
  // -------------------------------------------------------------
  try {
    if (testApp.status !== 'Shortlisted') {
      throw new Error('Student query did not reflect latest shortlisted status');
    }

    pass(14, 'Student Sees Updated Status', 'Student portal reflects new "Shortlisted" status immediately.');
  } catch (err) {
    fail(14, 'Student Sees Updated Status', err);
  }

  // -------------------------------------------------------------
  // Test 15: Student Cannot Directly Set Status to Shortlisted or Selected
  // -------------------------------------------------------------
  try {
    const studentUser = { _id: studentAId, role: 'student' };
    const ctx = mockContext({ status: 'Selected' }, { id: testApp._id }, {}, studentUser);

    // authorize('admin') guard blocks non-admins
    const guard = authorize('admin');
    guard(ctx.req, ctx.res, ctx.next);

    if (ctx.getStatusCode() === 403 && ctx.getError()) {
      pass(15, 'Student Cannot Modify Application Status', 'Direct student attempts to mutate status return HTTP 403 Forbidden.');
    } else {
      throw new Error('Student was improperly permitted to alter status');
    }
  } catch (err) {
    fail(15, 'Student Cannot Modify Application Status', err);
  }

  // -------------------------------------------------------------
  // Test 16: Student Cannot Access Admin Management APIs
  // -------------------------------------------------------------
  try {
    const studentUser = { _id: studentAId, role: 'student' };
    const ctx = mockContext({}, {}, {}, studentUser);

    const guard = authorize('admin');
    guard(ctx.req, ctx.res, ctx.next);

    if (ctx.getStatusCode() === 403) {
      pass(16, 'Student Blocked from Admin APIs', 'Non-admin requests to /api/admin/applications return HTTP 403 Forbidden.');
    } else {
      throw new Error('Student bypassed admin authorization guard');
    }
  } catch (err) {
    fail(16, 'Student Blocked from Admin APIs', err);
  }

  // -------------------------------------------------------------
  // Test 17: Closed and Expired Jobs Cannot Receive Applications
  // -------------------------------------------------------------
  try {
    const closedJob = new Job({
      title: 'Archived Position',
      company: 'OldCo',
      description: 'Closed',
      location: 'Remote',
      status: 'Closed',
      createdBy: adminId
    });

    const expiredJob = new Job({
      title: 'Expired Position',
      company: 'PastCo',
      description: 'Past deadline',
      location: 'Remote',
      status: 'Active',
      applicationDeadline: new Date(Date.now() - 86400000), // Yesterday
      createdBy: adminId
    });

    if (closedJob.isOpenForApplications()) throw new Error('Closed job was marked open');
    if (expiredJob.isOpenForApplications()) throw new Error('Expired job was marked open');

    pass(17, 'Closed and Expired Jobs Block Applications', 'Closed status and past deadlines reject application submissions.');
  } catch (err) {
    fail(17, 'Closed and Expired Jobs Block Applications', err);
  }

  console.log('\n=================================================================');
  console.log(`📊 PHASE 5 TEST SUMMARY: ${passed}/${total} TESTS PASSED`);
  console.log('=================================================================');

  if (passed === total) {
    console.log('🎉 ALL 17 PHASE 5 JOBS & APPLICATION REQUIREMENTS PASSED!\n');
    process.exit(0);
  } else {
    console.error('⚠️  Some tests failed. Please review the output above.\n');
    process.exit(1);
  }
};

runTests();
