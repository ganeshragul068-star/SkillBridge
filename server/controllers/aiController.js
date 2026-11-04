/**
 * SkillBridge AI Integration Controller
 * Powered by Google Gemini API with fallback to OpenAI
 */

const {
  isGeminiConfigured,
  generateProfessionalSummary,
  improveProjectBulletPoints,
  analyzeResumeContent
} = require('../services/geminiService');

// @desc    Analyze student resume against job description or target role
// @route   POST /api/ai/resume-analysis
// @access  Public / Protected
exports.analyzeResume = async (req, res, next) => {
  try {
    const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);

    if (!hasKey) {
      return res.status(503).json({
        success: false,
        message: 'AI provider is not configured. Please set GEMINI_API_KEY in server/.env to enable live AI resume analysis.'
      });
    }

    const { resumeText, targetRole, jobDescription, customRequirements } = req.body;

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resumeText for AI analysis.'
      });
    }

    // 1. Preferred Provider: Google Gemini
    if (process.env.GEMINI_API_KEY) {
      try {
        const analysis = await analyzeResumeContent({
          resumeText,
          targetRole,
          jobDescription,
          customRequirements
        });

        return res.status(200).json({
          success: true,
          message: 'Resume analyzed successfully via live Gemini AI engine',
          data: analysis
        });
      } catch (geminiError) {
        // If not OpenAI available, return Gemini error
        if (!process.env.OPENAI_API_KEY) {
          return res.status(geminiError.status || 502).json({
            success: false,
            message: `Gemini AI Provider Error: ${geminiError.message}`
          });
        }
      }
    }

    // 2. Secondary Provider: OpenAI
    if (process.env.OPENAI_API_KEY) {
      const systemPrompt = `You are an expert ATS recruiter. Analyze resume against role: "${targetRole}". Return JSON with: atsScore, categoryScores, strengths, weakSections, missingInformation, missingKeywords, foundKeywords, recommendedSkills, formattingIssues, grammarAndSpellingIssues, projectSuggestions, summarySuggestion, actionableImprovements, jobSpecificComparison.`;

      const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an ATS auditor. Return valid JSON only.' },
            { role: 'user', content: `${systemPrompt}\n\nResume:\n${resumeText.slice(0, 10000)}` }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json().catch(() => ({}));
        return res.status(502).json({
          success: false,
          message: `OpenAI Provider Error: ${errorData.error ? errorData.error.message : aiResponse.statusText}`
        });
      }

      const responseJson = await aiResponse.json();
      const generatedContent = responseJson.choices?.[0]?.message?.content;
      const parsedAnalysis = JSON.parse(generatedContent);

      return res.status(200).json({
        success: true,
        message: 'Resume analyzed successfully via live OpenAI engine',
        data: parsedAnalysis
      });
    }

    return res.status(503).json({
      success: false,
      message: 'AI provider is not configured. Please set GEMINI_API_KEY in server/.env.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate professional summaries using Google Gemini
// @route   POST /api/ai/generate-summary
// @access  Public / Protected
exports.generateSummary = async (req, res, next) => {
  try {
    if (!isGeminiConfigured() && !process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'AI provider is not configured. Please set GEMINI_API_KEY in server/.env to use AI summary generation.'
      });
    }

    const { fullName, targetRole, skills, education, experience, projects } = req.body;

    const result = await generateProfessionalSummary({
      fullName,
      targetRole,
      skills,
      education,
      experience,
      projects
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Improve project bullet points using Google Gemini
// @route   POST /api/ai/improve-project
// @access  Public / Protected
exports.improveProject = async (req, res, next) => {
  try {
    if (!isGeminiConfigured() && !process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'AI provider is not configured. Please set GEMINI_API_KEY in server/.env to use AI project enhancement.'
      });
    }

    const { title, description, technologies, existingPoints } = req.body;

    const result = await improveProjectBulletPoints({
      title,
      description,
      technologies,
      existingPoints
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check AI integration provider status
// @route   GET /api/ai/status
// @access  Public
exports.getAiStatus = (req, res) => {
  const isConfigured = Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
  res.status(200).json({
    success: true,
    data: {
      provider: process.env.GEMINI_API_KEY ? 'Google Gemini 2.5 Flash' : (process.env.OPENAI_API_KEY ? 'OpenAI gpt-4o-mini' : 'None'),
      isConfigured,
      message: isConfigured
        ? 'AI provider is configured and operational.'
        : 'AI provider is not configured. Set GEMINI_API_KEY in server/.env to enable live AI features.'
    }
  });
};
