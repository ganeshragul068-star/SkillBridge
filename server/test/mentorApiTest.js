/**
 * SkillBridge — Mentor Matching System API Route & Controller Integration Test
 */

require('dotenv').config();
const assert = require('assert');

process.env.DATA_MODE = 'demo';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'SkillBridgeDevelopmentSecretKey2026!DemoMode';

const User = require('../models/User');
const Mentor = require('../models/Mentor');
const MentorshipRequest = require('../models/MentorshipRequest');
const mentorController = require('../controllers/mentorController');
const mentorshipRequestController = require('../controllers/mentorshipRequestController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Mock Express Context Helper
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
    getStatus: () => statusCode,
    getData: () => jsonResponse,
    getError: () => nextError
  };
};

const runApiTests = async () => {
  console.log('=================================================================');
  console.log('🌐 SkillBridge Mentor System API & Controller Integration Tests');
  console.log('=================================================================');

  const admin = await User.findOne({ role: 'admin' });
  const student = await User.findOne({ role: 'student' });
  assert(admin, 'Admin required');
  assert(student, 'Student required');

  // 1. GET /api/mentors
  {
    const ctx = mockContext({}, {}, {}, {});
    await mentorController.getAllMentors(ctx.req, ctx.res, ctx.next);
    assert.strictEqual(ctx.getStatus(), 200);
    assert(ctx.getData().success);
    assert(ctx.getData().count >= 6);
    console.log(`✅ [API Test 1]: GET /api/mentors -> HTTP 200 (${ctx.getData().count} active mentors retrieved)`);
  }

  // 2. GET /api/mentors?search=Marcus
  {
    const ctx = mockContext({}, {}, {}, { search: 'Marcus' });
    await mentorController.getAllMentors(ctx.req, ctx.res, ctx.next);
    assert.strictEqual(ctx.getStatus(), 200);
    assert(ctx.getData().data.length >= 1);
    assert.strictEqual(ctx.getData().data[0].name, 'Marcus Vance');
    console.log(`✅ [API Test 2]: GET /api/mentors?search=Marcus -> HTTP 200 (Found ${ctx.getData().data[0].name})`);
  }

  // 3. GET /api/mentors/recommendations (Authenticated Student)
  let topMentorId = null;
  {
    const ctx = mockContext({}, {}, {}, { role: 'Frontend Developer' }, student);
    await mentorController.getRecommendedMentors(ctx.req, ctx.res, ctx.next);
    assert.strictEqual(ctx.getStatus(), 200);
    assert(ctx.getData().success);
    assert(ctx.getData().count >= 6);
    topMentorId = ctx.getData().data[0].mentorId;
    const top = ctx.getData().data[0];
    assert(top.matchScore >= 0 && top.matchScore <= 100);
    console.log(`✅ [API Test 3]: GET /api/mentors/recommendations -> HTTP 200 (Top match: ${top.mentorName} with ${top.matchScore}%)`);
  }

  // 4. GET /api/mentors/:id/match-details
  {
    const ctx = mockContext({}, {}, { id: topMentorId }, {}, student);
    await mentorController.getMentorMatchDetails(ctx.req, ctx.res, ctx.next);
    assert.strictEqual(ctx.getStatus(), 200);
    assert(ctx.getData().data.match.scoreBreakdown);
    console.log(`✅ [API Test 4]: GET /api/mentors/:id/match-details -> HTTP 200 (Reason: ${ctx.getData().data.match.recommendationReason})`);
  }

  // 5. POST /api/mentorship-requests
  let createdReqId = null;
  {
    const allMentors = await Mentor.find({ isActive: true });
    // Pick a mentor without an existing pending request
    const availableMentor = allMentors.find((m) => m._id.toString() !== '65e0a0000000000000000001') || allMentors[0];

    const ctx = mockContext(
      { mentorId: availableMentor._id.toString(), message: 'Hello, looking for guidance on system architecture.' },
      {}, {}, {}, student
    );
    await mentorshipRequestController.createMentorshipRequest(ctx.req, ctx.res, ctx.next);
    assert.strictEqual(ctx.getStatus(), 201);
    assert(ctx.getData().data._id);
    createdReqId = ctx.getData().data._id;
    console.log(`✅ [API Test 5]: POST /api/mentorship-requests -> HTTP 201 (${ctx.getData().message})`);
  }

  // 6. GET /api/mentorship-requests/my
  {
    const ctx = mockContext({}, {}, {}, {}, student);
    await mentorshipRequestController.getMyRequests(ctx.req, ctx.res, ctx.next);
    assert.strictEqual(ctx.getStatus(), 200);
    assert(ctx.getData().count >= 1);
    console.log(`✅ [API Test 6]: GET /api/mentorship-requests/my -> HTTP 200 (${ctx.getData().count} requests retrieved)`);
  }

  // 7. PATCH /api/mentorship-requests/:id/cancel
  {
    const ctx = mockContext({}, {}, { id: createdReqId }, {}, student);
    await mentorshipRequestController.cancelMyRequest(ctx.req, ctx.res, ctx.next);
    assert.strictEqual(ctx.getStatus(), 200);
    assert.strictEqual(ctx.getData().data.status, 'Cancelled');
    console.log(`✅ [API Test 7]: PATCH /api/mentorship-requests/:id/cancel -> HTTP 200 (Status transitioned to Cancelled)`);
  }

  // 8. GET /api/admin/mentors/stats
  {
    const ctx = mockContext({}, {}, {}, {}, admin);
    await mentorController.getAdminMentorStats(ctx.req, ctx.res, ctx.next);
    assert.strictEqual(ctx.getStatus(), 200);
    assert(ctx.getData().data.totalMentors >= 6);
    console.log(`✅ [API Test 8]: GET /api/admin/mentors/stats -> HTTP 200 (${ctx.getData().data.totalMentors} total mentors, ${ctx.getData().data.totalRequests} platform requests)`);
  }

  // 9. RBAC Security Check: Student blocked from Admin Endpoints (403)
  {
    let authFailed = false;
    const req = { user: student };
    const res = {
      status: (code) => {
        if (code === 403) authFailed = true;
        return res;
      },
      json: () => res
    };
    const next = () => {};

    authorize('admin')(req, res, next);
    assert.strictEqual(authFailed, true, 'Student must receive 403 Forbidden on admin endpoints');
    console.log(`✅ [API Test 9]: RBAC Security Guard: Student strictly blocked from admin endpoints -> HTTP 403 Forbidden`);
  }

  console.log('=================================================================');
  console.log('🎉 ALL 9 API INTEGRATION TESTS PASSED SUCCESSFULLY!');
  console.log('=================================================================');
};

runApiTests().catch((err) => {
  console.error('❌ API Integration Test failed:', err);
  process.exit(1);
});
