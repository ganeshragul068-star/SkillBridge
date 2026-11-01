/**
 * SkillBridge Phase 8 Test Suite: Resume Builder, Multi-Template PDF Export & AI Analysis
 * 
 * Comprehensive verification of:
 * 1. Template catalog listing (ats, modern, classic)
 * 2. Resume creation with Profile auto-population
 * 3. Student ownership isolation (403 for unauthorized access)
 * 4. Resume retrieval and listing
 * 5. Resume update with section persistence
 * 6. Resume duplication with (Copy) naming
 * 7. Resume deletion by owner
 * 8. PDF generation and export for ATS template
 * 9. PDF generation and export for Modern Technical template
 * 10. PDF generation and export for Classic Professional template
 * 11. PDF export handling missing/empty sections gracefully
 * 12. Text extraction from PDF upload simulation with skill detection
 * 13. Text extraction rejection for unsupported media types
 * 14. Corrupted file error handling without crashing (422)
 * 15. Job-specific resume matching calculation and project relevance
 * 16. Resume analysis history retrieval
 * 17. Honest AI configuration guard (strictly 503 without fake scores)
 */

require('dotenv').config();
const assert = require('assert');

// Import Models
const User = require('../models/User');
const Profile = require('../models/Profile');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const ResumeAnalysis = require('../models/ResumeAnalysis');

// Import Controllers
const resumeController = require('../controllers/resumeController');
const aiController = require('../controllers/aiController');
const { generatePdfBuffer } = require('../services/pdfService');

console.log('=================================================================');
console.log('📄 SkillBridge Phase 8 Resume Builder & AI Analysis Verification');
console.log('=================================================================\n');

let passed = 0;
const total = 18;

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
const mockContext = (body = {}, headers = {}, params = {}, query = {}, user = null, file = null) => {
  let statusCode = 200;
  let jsonResponse = null;
  let sentData = null;
  let responseHeaders = {};
  let nextError = null;

  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      jsonResponse = data;
      return res;
    },
    set: (headersObj) => {
      responseHeaders = { ...responseHeaders, ...headersObj };
      return res;
    },
    end: (data) => {
      sentData = data;
      return res;
    },
    send: (data) => {
      sentData = data;
      return res;
    }
  };

  const req = {
    body,
    headers,
    params,
    query,
    user,
    file
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
    getSentData: () => sentData,
    getHeaders: () => responseHeaders,
    getNextError: () => nextError
  };
};

const runResumeTests = async () => {
  try {
    // Retrieve Seeded Student & Admin Users
    const studentUser = await User.findOne({ email: 'alex.johnson@college.edu' });
    const adminUser = await User.findOne({ role: 'admin' });
    const otherStudent = await User.create({
      name: 'Rohan Sharma',
      email: 'rohan.sharma@college.edu',
      password: 'Student@Password123',
      role: 'student'
    });

    assert(studentUser, 'Seeded student user (Alex Johnson) must exist');
    assert(adminUser, 'Seeded admin user must exist');

    // -------------------------------------------------------------
    // Test 1: Template Catalog Listing
    // -------------------------------------------------------------
    {
      const ctx = mockContext();
      resumeController.getTemplates(ctx.req, ctx.res);
      const json = ctx.getJSON();

      assert.strictEqual(ctx.getStatusCode(), 200);
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.length, 3);
      const templateIds = json.data.map(t => t.id);
      assert(templateIds.includes('ats'));
      assert(templateIds.includes('modern'));
      assert(templateIds.includes('classic'));
      pass(1, 'Templates Catalog Listing', 'Returned 3 verified templates: ats, modern, classic');
    }

    // -------------------------------------------------------------
    // Test 2: Resume Creation with Profile Auto-Population
    // -------------------------------------------------------------
    let createdResumeId = null;
    {
      const ctx = mockContext(
        {
          title: 'Full Stack Web Engineer Resume',
          targetRole: 'Full Stack MERN Developer',
          template: 'ats'
          // Omitting personalInfo, education, skills to test auto-population from student profile
        },
        {},
        {},
        {},
        studentUser
      );

      await resumeController.createResume(ctx.req, ctx.res, ctx.next);
      const json = ctx.getJSON();

      assert.strictEqual(ctx.getStatusCode(), 201);
      assert.strictEqual(json.success, true);
      assert(json.data._id);
      assert.strictEqual(json.data.title, 'Full Stack Web Engineer Resume');
      assert.strictEqual(json.data.personalInfo.fullName, 'Alex Johnson');
      assert(json.data.skills.length > 0, 'Should auto-populate skills from student profile');
      assert(json.data.education.length > 0, 'Should auto-populate education from profile');

      createdResumeId = json.data._id.toString();
      pass(2, 'Resume Creation with Auto-Population', `Created resume ID ${createdResumeId} auto-populated from profile`);
    }

    // -------------------------------------------------------------
    // Test 3: Student Ownership Isolation (403 for Unauthorized Student)
    // -------------------------------------------------------------
    {
      const ctx = mockContext({}, {}, { id: createdResumeId }, {}, otherStudent);
      await resumeController.getResumeById(ctx.req, ctx.res, ctx.next);

      assert.strictEqual(ctx.getStatusCode(), 403, 'Unauthorized student must receive 403 Forbidden');
      assert.strictEqual(ctx.getJSON().success, false);
      pass(3, 'Ownership Isolation Guard', 'Unauthorized student blocked with 403 Forbidden');
    }

    // -------------------------------------------------------------
    // Test 4: Resume Retrieval by Owner & Admin
    // -------------------------------------------------------------
    {
      // Owner retrieval
      const ownerCtx = mockContext({}, {}, { id: createdResumeId }, {}, studentUser);
      await resumeController.getResumeById(ownerCtx.req, ownerCtx.res, ownerCtx.next);
      assert.strictEqual(ownerCtx.getStatusCode(), 200);
      assert.strictEqual(ownerCtx.getJSON().data._id.toString(), createdResumeId);

      // Admin retrieval
      const adminCtx = mockContext({}, {}, { id: createdResumeId }, {}, adminUser);
      await resumeController.getResumeById(adminCtx.req, adminCtx.res, adminCtx.next);
      assert.strictEqual(adminCtx.getStatusCode(), 200);

      // Student resumes list
      const listCtx = mockContext({}, {}, {}, {}, studentUser);
      await resumeController.getMyResumes(listCtx.req, listCtx.res, listCtx.next);
      assert.strictEqual(listCtx.getStatusCode(), 200);
      assert(listCtx.getJSON().count >= 1);
      pass(4, 'Resume Retrieval & Listing', 'Owner and Admin authorized to view; student listing succeeds');
    }

    // -------------------------------------------------------------
    // Test 5: Resume Update
    // -------------------------------------------------------------
    {
      const updatePayload = {
        title: 'Senior MERN Developer Resume',
        targetRole: 'Full Stack Tech Lead',
        template: 'modern',
        certifications: [
          {
            name: 'AWS Certified Cloud Practitioner',
            issuingOrganization: 'Amazon Web Services',
            issueDate: '2025-08-10'
          }
        ]
      };

      const ctx = mockContext(updatePayload, {}, { id: createdResumeId }, {}, studentUser);
      await resumeController.updateResume(ctx.req, ctx.res, ctx.next);
      const json = ctx.getJSON();

      assert.strictEqual(ctx.getStatusCode(), 200);
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.title, 'Senior MERN Developer Resume');
      assert.strictEqual(json.data.template, 'modern');
      assert.strictEqual(json.data.certifications.length, 1);
      pass(5, 'Resume Update', 'Fields and nested certification sections updated and persisted');
    }

    // -------------------------------------------------------------
    // Test 6: Resume Duplication
    // -------------------------------------------------------------
    let duplicatedResumeId = null;
    {
      const ctx = mockContext({}, {}, { id: createdResumeId }, {}, studentUser);
      await resumeController.duplicateResume(ctx.req, ctx.res, ctx.next);
      const json = ctx.getJSON();

      assert.strictEqual(ctx.getStatusCode(), 201);
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.title, 'Senior MERN Developer Resume (Copy)');
      assert.strictEqual(json.data.isDefault, false);
      duplicatedResumeId = json.data._id.toString();
      pass(6, 'Resume Duplication', `Cloned resume created as ID ${duplicatedResumeId} with (Copy) suffix`);
    }

    // -------------------------------------------------------------
    // Test 7: Resume Deletion by Owner
    // -------------------------------------------------------------
    {
      // Unauthorized deletion attempt
      const unauthCtx = mockContext({}, {}, { id: duplicatedResumeId }, {}, otherStudent);
      await resumeController.deleteResume(unauthCtx.req, unauthCtx.res, unauthCtx.next);
      assert.strictEqual(unauthCtx.getStatusCode(), 403);

      // Authorized deletion by owner
      const authCtx = mockContext({}, {}, { id: duplicatedResumeId }, {}, studentUser);
      await resumeController.deleteResume(authCtx.req, authCtx.res, authCtx.next);
      assert.strictEqual(authCtx.getStatusCode(), 200);

      // Verify it no longer exists
      const verifyDoc = await Resume.findById(duplicatedResumeId);
      assert.strictEqual(verifyDoc, null);
      pass(7, 'Resume Deletion Guard', 'Unauthorized deletion rejected (403); owner deletion verified');
    }

    // -------------------------------------------------------------
    // Test 8: PDF Generation and Export - ATS Template
    // -------------------------------------------------------------
    {
      const resumeDoc = await Resume.findById(createdResumeId);
      resumeDoc.template = 'ats';
      await resumeDoc.save();

      const ctx = mockContext({}, {}, { id: createdResumeId }, {}, studentUser);
      await resumeController.exportPdf(ctx.req, ctx.res, ctx.next);

      const buffer = ctx.getSentData();
      assert(Buffer.isBuffer(buffer), 'Exported data must be a Buffer');
      assert(buffer.length > 500, 'PDF buffer length should be substantial');
      assert.strictEqual(buffer.slice(0, 4).toString(), '%PDF', 'PDF buffer must start with %PDF magic bytes');
      assert.strictEqual(ctx.getHeaders()['Content-Type'], 'application/pdf');
      pass(8, 'PDF Export - ATS Template', `Generated valid %PDF stream (${buffer.length} bytes)`);
    }

    // -------------------------------------------------------------
    // Test 9: PDF Generation and Export - Modern Template
    // -------------------------------------------------------------
    {
      const resumeDoc = await Resume.findById(createdResumeId);
      resumeDoc.template = 'modern';
      await resumeDoc.save();

      const ctx = mockContext({}, {}, { id: createdResumeId }, { template: 'modern' }, studentUser);
      await resumeController.exportPdf(ctx.req, ctx.res, ctx.next);

      const buffer = ctx.getSentData();
      assert(Buffer.isBuffer(buffer));
      assert.strictEqual(buffer.slice(0, 4).toString(), '%PDF');
      pass(9, 'PDF Export - Modern Template', `Generated valid Modern layout PDF (${buffer.length} bytes)`);
    }

    // -------------------------------------------------------------
    // Test 10: PDF Generation and Export - Classic Template
    // -------------------------------------------------------------
    {
      const ctx = mockContext({}, {}, { id: createdResumeId }, { template: 'classic' }, studentUser);
      await resumeController.exportPdf(ctx.req, ctx.res, ctx.next);

      const buffer = ctx.getSentData();
      assert(Buffer.isBuffer(buffer));
      assert.strictEqual(buffer.slice(0, 4).toString(), '%PDF');
      pass(10, 'PDF Export - Classic Template', `Generated valid Classic serif PDF (${buffer.length} bytes)`);
    }

    // -------------------------------------------------------------
    // Test 11: PDF Handling Missing / Empty Sections Gracefully
    // -------------------------------------------------------------
    {
      const minimalResume = {
        title: 'Minimal Resume',
        template: 'ats',
        personalInfo: { fullName: 'Minimal Candidate', email: 'minimal@test.com' },
        education: [],
        experience: [],
        projects: [],
        skills: [],
        certifications: []
      };

      const buffer = await generatePdfBuffer(minimalResume);
      assert(Buffer.isBuffer(buffer));
      assert.strictEqual(buffer.slice(0, 4).toString(), '%PDF');
      pass(11, 'Empty Sections Handled Gracefully', `Zero crashes when sections are empty (${buffer.length} bytes)`);
    }

    // -------------------------------------------------------------
    // Test 12: Text Extraction from PDF Upload Simulation
    // -------------------------------------------------------------
    {
      // Create a valid simple PDF buffer using generatePdfBuffer
      const sampleBuffer = await generatePdfBuffer({
        title: 'Uploaded Sample Resume',
        template: 'ats',
        personalInfo: { fullName: 'Sample Candidate', email: 'sample@test.com' },
        skills: [
          { name: 'JavaScript', category: 'Tech' },
          { name: 'React', category: 'Tech' },
          { name: 'Node.js', category: 'Tech' },
          { name: 'MongoDB', category: 'Tech' }
        ],
        projects: [
          { title: 'Portfolio Project', description: 'Built with React and Node.js REST API' }
        ]
      });

      const mockFile = {
        originalname: 'alex_johnson_resume.pdf',
        mimetype: 'application/pdf',
        size: sampleBuffer.length,
        buffer: sampleBuffer
      };

      const ctx = mockContext({}, {}, {}, {}, studentUser, mockFile);
      await resumeController.uploadAndExtract(ctx.req, ctx.res, ctx.next);
      const json = ctx.getJSON();

      assert.strictEqual(ctx.getStatusCode(), 200);
      assert.strictEqual(json.success, true);
      assert(json.data.wordCount > 0);
      assert(json.data.detectedSkills.includes('React'));
      assert(json.data.detectedSkills.includes('JavaScript'));
      pass(12, 'PDF Upload & Text Extraction', `Extracted ${json.data.wordCount} words; detected: ${json.data.detectedSkills.join(', ')}`);
    }

    // -------------------------------------------------------------
    // Test 13: Upload Rejection for Unsupported Media Types
    // -------------------------------------------------------------
    {
      const invalidFile = {
        originalname: 'image.png',
        mimetype: 'image/png',
        size: 1024,
        buffer: Buffer.from('fake image content')
      };

      const ctx = mockContext({}, {}, {}, {}, studentUser, invalidFile);
      await resumeController.uploadAndExtract(ctx.req, ctx.res, ctx.next);

      assert.strictEqual(ctx.getStatusCode(), 415, 'Should return 415 Unsupported Media Type');
      assert.strictEqual(ctx.getJSON().success, false);
      pass(13, 'Unsupported Media Type Guard', 'Rejected non-PDF/DOCX file with HTTP 415');
    }

    // -------------------------------------------------------------
    // Test 14: Corrupted File Error Handling (422)
    // -------------------------------------------------------------
    {
      const corruptFile = {
        originalname: 'corrupt.pdf',
        mimetype: 'application/pdf',
        size: 200,
        buffer: Buffer.from('this is not a valid pdf stream header')
      };

      const ctx = mockContext({}, {}, {}, {}, studentUser, corruptFile);
      await resumeController.uploadAndExtract(ctx.req, ctx.res, ctx.next);

      assert.strictEqual(ctx.getStatusCode(), 422, 'Should return 422 Unprocessable Entity');
      assert.strictEqual(ctx.getJSON().success, false);
      pass(14, 'Corrupt File Safe Handling', 'Gracefully handled corrupt PDF without server exception (422)');
    }

    // -------------------------------------------------------------
    // Test 15: Job-Specific Resume Matching & Project Relevance
    // -------------------------------------------------------------
    let analysisId = null;
    {
      const allJobs = await Job.find({});
      const targetJob = allJobs[0];

      const matchPayload = {
        resumeId: createdResumeId,
        jobId: targetJob._id,
        customRequirements: ['React.js', 'Node.js', 'Docker', 'AWS']
      };

      const ctx = mockContext(matchPayload, {}, {}, {}, studentUser);
      await resumeController.compareJobMatch(ctx.req, ctx.res, ctx.next);
      const json = ctx.getJSON();

      assert.strictEqual(ctx.getStatusCode(), 200);
      assert.strictEqual(json.success, true);
      assert(typeof json.data.matchPercentage === 'number');
      assert(Array.isArray(json.data.matchingSkills));
      assert(Array.isArray(json.data.missingSkills));
      assert(Array.isArray(json.data.strengths));
      assert(Array.isArray(json.data.improvements));
      assert(json.data.matchingSkills.length > 0);

      analysisId = json.data._id.toString();
      pass(15, 'Job-Specific Resume Matching', `Calculated ${json.data.matchPercentage}% match for ${json.data.jobTitle}`);
    }

    // -------------------------------------------------------------
    // Test 16: Resume Analysis History Retrieval
    // -------------------------------------------------------------
    {
      const ctx = mockContext({}, {}, {}, {}, studentUser);
      await resumeController.getMyAnalyses(ctx.req, ctx.res, ctx.next);
      const json = ctx.getJSON();

      assert.strictEqual(ctx.getStatusCode(), 200);
      assert.strictEqual(json.success, true);
      assert(json.count >= 1);

      // Single analysis retrieval
      const singleCtx = mockContext({}, {}, { id: analysisId }, {}, studentUser);
      await resumeController.getAnalysisById(singleCtx.req, singleCtx.res, singleCtx.next);
      assert.strictEqual(singleCtx.getStatusCode(), 200);
      assert.strictEqual(singleCtx.getJSON().data._id.toString(), analysisId);

      // Other student blocked from reading analysis
      const unauthCtx = mockContext({}, {}, { id: analysisId }, {}, otherStudent);
      await resumeController.getAnalysisById(unauthCtx.req, unauthCtx.res, unauthCtx.next);
      assert.strictEqual(unauthCtx.getStatusCode(), 403);
      pass(16, 'Analysis History & Ownership', 'Student history retrieved with strict ownership access control');
    }

    // -------------------------------------------------------------
    // Test 17: Honest AI Configuration Guard (Strict 503)
    // -------------------------------------------------------------
    {
      // Ensure AI API key is not set for honest configuration check
      const savedGemini = process.env.GEMINI_API_KEY;
      const savedOpenAi = process.env.OPENAI_API_KEY;
      delete process.env.GEMINI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      const aiCtx = mockContext({
        resumeText: 'Alex Johnson - Experienced React Developer with Node.js and MongoDB.',
        targetRole: 'Full Stack Developer'
      });

      await aiController.analyzeResume(aiCtx.req, aiCtx.res, aiCtx.next);
      assert.strictEqual(aiCtx.getStatusCode(), 503, 'Must return 503 Service Unavailable when AI key is missing');
      assert.strictEqual(aiCtx.getJSON().success, false);
      assert(aiCtx.getJSON().message.includes('AI provider is not configured'));

      // Restore environment variables
      if (savedGemini) process.env.GEMINI_API_KEY = savedGemini;
      if (savedOpenAi) process.env.OPENAI_API_KEY = savedOpenAi;

      pass(17, 'Honest AI Configuration Guard', 'Strictly returns HTTP 503 without fake scores or mocked AI');
    }

    // -------------------------------------------------------------
    // Test 18: Live AI Integration Response Schema Verification
    // -------------------------------------------------------------
    {
      const globalFetch = global.fetch;
      // Mock live AI response from provider
      global.fetch = async (url) => {
        if (url.includes('generativelanguage.googleapis.com')) {
          return {
            ok: true,
            json: async () => ({
              candidates: [
                {
                  content: {
                    parts: [
                      {
                        text: JSON.stringify({
                          atsScore: 88,
                          matchProbability: 'High',
                          foundKeywords: ['JavaScript', 'React.js', 'Node.js', 'MongoDB', 'REST APIs'],
                          missingKeywords: ['TypeScript', 'Docker', 'CI/CD'],
                          skillsAnalysis: {
                            strengths: ['Full-stack MERN expertise', 'RESTful API routing'],
                            missingGaps: ['Containerization with Docker', 'Static typing with TypeScript']
                          },
                          educationAndExperience: 'B.Tech in Computer Science provides foundational algorithmic grounding.',
                          projectsEvaluation: 'CampHub demonstrates practical full-stack deployment and authentication integration.',
                          missingInformation: ['Specific test coverage metrics (e.g. Jest)', 'Cloud deployment URLs'],
                          formattingFeedback: ['Clean single-column ATS layout is fully machine-readable.'],
                          actionableImprovements: [
                            'Add Docker containerization to the skills matrix.',
                            'Quantify project achievements with STAR bullet points.'
                          ]
                        })
                      }
                    ]
                  }
                }
              ]
            })
          };
        }
        return globalFetch(url);
      };

      process.env.GEMINI_API_KEY = 'demo_ai_simulation_key_for_test';

      const aiCtx = mockContext({
        resumeText: 'Alex Johnson - Experienced React Developer with Node.js, Express, and MongoDB. Built CampHub.',
        targetRole: 'Full Stack Developer',
        jobDescription: 'Seeking Full Stack MERN engineer with Docker and TypeScript experience.'
      });

      await aiController.analyzeResume(aiCtx.req, aiCtx.res, aiCtx.next);

      assert.strictEqual(aiCtx.getStatusCode(), 200);
      assert.strictEqual(aiCtx.getJSON().success, true);
      const data = aiCtx.getJSON().data;
      assert.strictEqual(data.atsScore, 88);
      assert.strictEqual(data.matchProbability, 'High');
      assert(Array.isArray(data.foundKeywords) && data.foundKeywords.includes('React.js'));
      assert(Array.isArray(data.missingKeywords) && data.missingKeywords.includes('Docker'));
      assert(Array.isArray(data.actionableImprovements) && data.actionableImprovements.length >= 2);
      assert(data.educationAndExperience);
      assert(data.projectsEvaluation);

      // Restore
      global.fetch = globalFetch;
      delete process.env.GEMINI_API_KEY;

      pass(18, 'AI Resume Analysis with Active Provider Key', `Validated structured schema: Score=${data.atsScore}%, ${data.foundKeywords.length} keywords found, ${data.missingKeywords.length} gaps identified`);
    }

    console.log('\n=================================================================');
    console.log(`🎉 ALL ${passed}/${total} PHASE 8 VERIFICATION TESTS PASSED SUCCESSFULLY!`);
    console.log('=================================================================\n');
    process.exit(0);
  } catch (error) {
    fail(passed + 1, 'Phase 8 Test Execution Exception', error);
  }
};

runResumeTests();
