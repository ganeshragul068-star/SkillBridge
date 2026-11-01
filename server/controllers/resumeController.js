const Resume = require('../models/Resume');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const Profile = require('../models/Profile');
const Job = require('../models/Job');
const { generatePdfBuffer } = require('../services/pdfService');
const { normalizeSkill, calculateJobMatch } = require('../services/matchingService');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Supported Resume Templates Catalog
 */
const TEMPLATES = [
  {
    id: 'ats',
    name: 'ATS-Friendly Standard',
    badge: 'Harvard & Tech Standard',
    description: 'Clean, single-column monochrome format optimized for Applicant Tracking Systems and recruiter scanning.',
    recommended: true
  },
  {
    id: 'modern',
    name: 'Modern Technical',
    badge: 'Design & Engineering',
    description: 'Contemporary tech layout with subtle indigo accents, banner header, and organized skill chips.',
    recommended: false
  },
  {
    id: 'classic',
    name: 'Classic Professional',
    badge: 'Executive & Academic',
    description: 'Traditional serif typography with formal divider rules, centered headers, and executive styling.',
    recommended: false
  }
];

// @desc    Get available resume templates
// @route   GET /api/resumes/templates
// @access  Public
exports.getTemplates = (req, res) => {
  res.status(200).json({
    success: true,
    data: TEMPLATES
  });
};

// @desc    Get all resumes for authenticated student
// @route   GET /api/resumes
// @access  Private (Student)
exports.getMyResumes = async (req, res, next) => {
  try {
    const studentId = req.user._id || req.user.id;
    const resumes = await Resume.find({ studentId }).sort({ updatedAt: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resume by ID
// @route   GET /api/resumes/:id
// @access  Private (Owner / Admin)
exports.getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Ownership verification
    const currentUserId = (req.user._id || req.user.id).toString();
    const isOwner = resume.studentId.toString() === currentUserId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to view this resume'
      });
    }

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new resume (optionally auto-populating from Profile)
// @route   POST /api/resumes
// @access  Private (Student)
exports.createResume = async (req, res, next) => {
  try {
    const studentId = req.user._id || req.user.id;
    const payload = req.body || {};

    // Auto-populate from Student Profile if personalInfo or sections are missing
    let personalInfo = payload.personalInfo;
    let education = payload.education;
    let skills = payload.skills;
    let projects = payload.projects;

    if (!personalInfo || !personalInfo.fullName || !education || education.length === 0) {
      const profile = (await Profile.findOne({ userId: studentId })) || (await Profile.findOne({ user: studentId }));

      if (profile) {
        if (!personalInfo) {
          personalInfo = {
            fullName: req.user.name || 'Candidate Name',
            email: req.user.email || 'candidate@example.com',
            phone: profile.phone || '',
            location: profile.location || '',
            linkedinUrl: profile.socialLinks?.linkedin || '',
            githubUrl: profile.socialLinks?.github || '',
            portfolioUrl: profile.socialLinks?.portfolio || '',
            summary: profile.bio || ''
          };
        }

        if (!education || education.length === 0) {
          if (Array.isArray(profile.education) && profile.education.length > 0) {
            education = profile.education.map(e => ({
              institution: e.institution || profile.college || 'University',
              degree: e.degree || profile.degree || 'Bachelor of Technology',
              fieldOfStudy: e.fieldOfStudy || profile.department || 'Computer Science',
              startYear: e.startYear || (profile.graduationYear ? profile.graduationYear - 4 : 2022),
              endYear: e.endYear || profile.graduationYear || 2026,
              grade: e.grade || e.cgpa ? `${e.cgpa || e.grade} CGPA` : ''
            }));
          } else if (profile.college || profile.degree) {
            education = [
              {
                institution: profile.college || 'University',
                degree: profile.degree || 'Bachelor of Technology',
                fieldOfStudy: profile.department || 'Computer Science',
                startYear: profile.graduationYear ? profile.graduationYear - 4 : 2022,
                endYear: profile.graduationYear || 2026,
                grade: ''
              }
            ];
          }
        }

        if ((!skills || skills.length === 0) && Array.isArray(profile.skills)) {
          skills = profile.skills.map(s => {
            if (typeof s === 'string') {
              return { name: s, category: 'Technical Skills', proficiency: 'Intermediate' };
            }
            return {
              name: s.name || s.skillName || 'Skill',
              category: s.category || 'Technical Skills',
              proficiency: s.proficiency || 'Intermediate'
            };
          });
        }

        if ((!projects || projects.length === 0) && Array.isArray(profile.projects)) {
          projects = profile.projects.map(p => ({
            title: p.title || 'Project',
            description: p.description || '',
            technologies: Array.isArray(p.technologies) ? p.technologies : [],
            liveUrl: p.liveUrl || '',
            githubUrl: p.githubUrl || '',
            startDate: p.startDate || '',
            endDate: p.endDate || '',
            bulletPoints: Array.isArray(p.bulletPoints) ? p.bulletPoints : []
          }));
        }
      }
    }

    // Default fallback personal info
    if (!personalInfo) {
      personalInfo = {
        fullName: req.user.name || 'Student Candidate',
        email: req.user.email || 'student@example.com',
        phone: '',
        location: '',
        summary: ''
      };
    }

    const newResume = await Resume.create({
      studentId,
      title: payload.title || `${payload.targetRole || 'Full Stack Developer'} Resume`,
      targetRole: payload.targetRole || 'Full Stack Developer',
      template: payload.template || 'ats',
      personalInfo,
      education: education || [],
      experience: payload.experience || [],
      projects: projects || [],
      skills: skills || [],
      certifications: payload.certifications || [],
      customSections: payload.customSections || [],
      isDefault: payload.isDefault || false
    });

    res.status(201).json({
      success: true,
      message: 'Resume created successfully',
      data: newResume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing resume
// @route   PUT /api/resumes/:id
// @access  Private (Owner / Admin)
exports.updateResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const currentUserId = (req.user._id || req.user.id).toString();
    const isOwner = resume.studentId.toString() === currentUserId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to update this resume'
      });
    }

    // Update allowable fields
    const updatable = [
      'title',
      'targetRole',
      'template',
      'personalInfo',
      'education',
      'experience',
      'projects',
      'skills',
      'certifications',
      'customSections',
      'isDefault'
    ];

    updatable.forEach(field => {
      if (req.body[field] !== undefined) {
        resume[field] = req.body[field];
      }
    });

    const updated = await resume.save();

    res.status(200).json({
      success: true,
      message: 'Resume updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Duplicate an existing resume
// @route   POST /api/resumes/:id/duplicate
// @access  Private (Owner)
exports.duplicateResume = async (req, res, next) => {
  try {
    const original = await Resume.findById(req.params.id);

    if (!original) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const currentUserId = (req.user._id || req.user.id).toString();
    if (original.studentId.toString() !== currentUserId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to duplicate this resume'
      });
    }

    const cloned = await Resume.create({
      studentId: original.studentId,
      title: `${original.title} (Copy)`,
      targetRole: original.targetRole,
      template: original.template,
      personalInfo: original.personalInfo,
      education: original.education,
      experience: original.experience,
      projects: original.projects,
      skills: original.skills,
      certifications: original.certifications,
      customSections: original.customSections,
      isDefault: false
    });

    res.status(201).json({
      success: true,
      message: 'Resume duplicated successfully',
      data: cloned
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
// @access  Private (Owner / Admin)
exports.deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const currentUserId = (req.user._id || req.user.id).toString();
    const isOwner = resume.studentId.toString() === currentUserId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to delete this resume'
      });
    }

    await Resume.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate and download PDF for a resume
// @route   GET /api/resumes/:id/export-pdf
// @access  Private (Owner / Admin)
exports.exportPdf = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const currentUserId = (req.user._id || req.user.id).toString();
    const isOwner = resume.studentId.toString() === currentUserId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to export this resume'
      });
    }

    // Allow query template override (e.g. ?template=modern)
    const exportData = resume.toObject ? resume.toObject() : { ...resume };
    if (req.query.template && ['ats', 'modern', 'classic'].includes(req.query.template)) {
      exportData.template = req.query.template;
    }

    const pdfBuffer = await generatePdfBuffer(exportData);

    const safeTitle = (exportData.title || 'Resume')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_');
    const filename = `${safeTitle}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length
    });

    return res.end(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload resume (PDF or DOCX) and extract readable text
// @route   POST /api/resumes/upload-extract
// @access  Private
exports.uploadAndExtract = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a file to extract text from (PDF or DOCX)'
      });
    }

    const { originalname, mimetype, buffer, size } = req.file;

    // Verify size (max 5MB)
    if (size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds maximum allowed limit of 5MB'
      });
    }

    let extractedText = '';

    if (mimetype === 'application/pdf' || originalname.toLowerCase().endsWith('.pdf')) {
      try {
        if (typeof pdfParse === 'function') {
          const parsed = await pdfParse(buffer);
          extractedText = parsed.text || '';
        } else if (pdfParse && pdfParse.PDFParse) {
          const parser = new pdfParse.PDFParse(new Uint8Array(buffer));
          await parser.load();
          const textResult = await parser.getText();
          extractedText = typeof textResult === 'string' ? textResult : (textResult?.text || '');
        } else {
          extractedText = buffer.toString('utf8');
        }
      } catch (pdfErr) {
        return res.status(422).json({
          success: false,
          message: 'Unable to parse PDF document. The file may be corrupt or encrypted.',
          error: pdfErr.message
        });
      }
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword' ||
      originalname.toLowerCase().endsWith('.docx')
    ) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || '';
      } catch (docxErr) {
        return res.status(422).json({
          success: false,
          message: 'Unable to parse DOCX document. The file may be corrupt.',
          error: docxErr.message
        });
      }
    } else {
      return res.status(415).json({
        success: false,
        message: 'Unsupported media type. Only PDF and DOCX files are supported.'
      });
    }

    // Clean text and calculate metrics
    const cleanedText = extractedText.replace(/\r\n/g, '\n').trim();
    const wordCount = cleanedText ? cleanedText.split(/\s+/).filter(Boolean).length : 0;
    const charCount = cleanedText.length;
    const lines = cleanedText ? cleanedText.split('\n').filter(l => l.trim().length > 0).length : 0;

    // Detect candidate skills from common skill glossary
    const candidateSkills = detectSkillsFromText(cleanedText);

    res.status(200).json({
      success: true,
      message: 'Resume text extracted successfully',
      data: {
        fileName: originalname,
        fileType: mimetype,
        fileSize: size,
        wordCount,
        charCount,
        lineCount: lines,
        extractedText: cleanedText,
        detectedSkills: candidateSkills
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Compare resume against target job description or job ID
// @route   POST /api/resumes/compare-job
// @access  Private
exports.compareJobMatch = async (req, res, next) => {
  try {
    const studentId = req.user._id || req.user.id;
    const { resumeId, jobId, customRequirements, jobTitle, company, resumeText } = req.body;

    let resumeSkills = [];
    let resumeTitle = 'Submitted Resume';
    let targetRole = 'Target Role';
    let resumeProjects = [];

    if (resumeId) {
      const resume = await Resume.findById(resumeId);
      if (resume) {
        resumeTitle = resume.title;
        targetRole = resume.targetRole;
        resumeSkills = (resume.skills || []).map(s => s.name);
        resumeProjects = resume.projects || [];
      }
    }

    // If raw resume text or skills provided directly
    if (req.body.resumeSkills && Array.isArray(req.body.resumeSkills)) {
      resumeSkills = [...new Set([...resumeSkills, ...req.body.resumeSkills])];
    } else if (resumeText) {
      const detected = detectSkillsFromText(resumeText);
      resumeSkills = [...new Set([...resumeSkills, ...detected])];
    }

    // Resolve Job Requirements
    let jobReqs = [];
    let resolvedJobTitle = jobTitle || 'Target Role';
    let resolvedCompany = company || 'Hiring Company';
    let targetJob = null;

    if (jobId) {
      targetJob = await Job.findById(jobId);
      if (targetJob) {
        jobReqs = targetJob.skillsRequired || [];
        resolvedJobTitle = targetJob.title || resolvedJobTitle;
        resolvedCompany = targetJob.company || resolvedCompany;
      }
    }

    if (Array.isArray(customRequirements) && customRequirements.length > 0) {
      jobReqs = [...new Set([...jobReqs, ...customRequirements])];
    }

    if (jobReqs.length === 0) {
      // Default fallback requirements if neither jobId nor custom requirements supplied
      jobReqs = ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Git'];
    }

    // Compute explainable matching using matchingService
    const matchResult = calculateJobMatch(resumeSkills, jobReqs);

    // Identify relevant projects that utilize matching skills
    const relevantProjects = [];
    const normalizedMatches = new Set(matchResult.matchedSkills.map(s => normalizeSkill(s)));

    resumeProjects.forEach(proj => {
      const techList = Array.isArray(proj.technologies) ? proj.technologies : [];
      const hasMatch = techList.some(t => normalizedMatches.has(normalizeSkill(t)));
      if (hasMatch) {
        relevantProjects.push(proj.title);
      }
    });

    // Generate actionable strengths & improvement recommendations
    const strengths = [];
    const improvements = [];

    if (matchResult.matchPercentage >= 75) {
      strengths.push(`High skill match (${matchResult.matchPercentage}%) for ${resolvedJobTitle}.`);
    }
    if (matchResult.matchedSkills.length > 0) {
      strengths.push(`Strong coverage in core technologies: ${matchResult.matchedSkills.slice(0, 4).join(', ')}.`);
    }
    if (relevantProjects.length > 0) {
      strengths.push(`Resume includes ${relevantProjects.length} relevant project(s) applying required technologies.`);
    }

    if (matchResult.missingSkills.length > 0) {
      improvements.push(`Add or upskill in missing requirements: ${matchResult.missingSkills.join(', ')}.`);
      improvements.push(`Highlight any academic or extracurricular coursework involving ${matchResult.missingSkills[0]}.`);
    }
    if (resumeSkills.length < 5) {
      improvements.push('Expand technical skills section with developer tools (e.g. Git, Docker, Postman).');
    }

    // Save Analysis Record
    const analysisRecord = await ResumeAnalysis.create({
      studentId,
      resumeId: resumeId || null,
      resumeTitle,
      targetRole,
      jobId: jobId || null,
      jobTitle: resolvedJobTitle,
      company: resolvedCompany,
      source: resumeId ? 'saved-resume' : (resumeText ? 'raw-text' : 'saved-resume'),
      matchPercentage: matchResult.matchPercentage,
      matchingSkills: matchResult.matchedSkills,
      missingSkills: matchResult.missingSkills,
      strengths,
      improvements,
      relevantProjects,
      aiAnalysis: null,
      aiConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY)
    });

    res.status(200).json({
      success: true,
      message: 'Job-resume match analysis completed',
      data: analysisRecord
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all resume analyses for logged-in student
// @route   GET /api/resumes/analyses/history
// @access  Private (Student)
exports.getMyAnalyses = async (req, res, next) => {
  try {
    const studentId = req.user._id || req.user.id;
    const analyses = await ResumeAnalysis.find({ studentId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: analyses.length,
      data: analyses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single analysis by ID
// @route   GET /api/resumes/analyses/:id
// @access  Private (Owner / Admin)
exports.getAnalysisById = async (req, res, next) => {
  try {
    const analysis = await ResumeAnalysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis record not found'
      });
    }

    const currentUserId = (req.user._id || req.user.id).toString();
    if (analysis.studentId.toString() !== currentUserId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to view this analysis'
      });
    }

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper to detect common technical skills from raw extracted text
 */
function detectSkillsFromText(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const knownSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express.js',
    'MongoDB', 'SQL', 'PostgreSQL', 'MySQL', 'Python',
    'Java', 'C++', 'C#', 'HTML', 'CSS', 'Tailwind',
    'Git', 'GitHub', 'Docker', 'AWS', 'REST API', 'GraphQL',
    'Redux', 'Linux', 'Data Structures', 'Algorithms'
  ];

  return knownSkills.filter(skill => {
    const sLower = skill.toLowerCase();
    // Handle word boundary match
    const escaped = sLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'i');
    return regex.test(lower);
  });
}
