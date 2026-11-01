/**
 * AI Integration Controller
 * Completely independent of MongoDB.
 * Enforces live AI provider configuration without fake/hardcoded results.
 */

// @desc    Analyze student resume against job description or target role
// @route   POST /api/ai/resume-analysis
// @access  Public / Protected
exports.analyzeResume = async (req, res, next) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        success: false,
        message: 'AI provider is not configured. Please set GEMINI_API_KEY or OPENAI_API_KEY in server/.env to enable live AI resume analysis.'
      });
    }

    const { resumeText, targetRole, jobDescription } = req.body;

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resumeText for AI analysis.'
      });
    }

    const systemPrompt = `Act as an expert ATS (Applicant Tracking System) recruiter and technical hiring manager.
Analyze the provided student resume against the target role: "${targetRole || 'Full Stack Developer'}".
Job description context: "${jobDescription || 'Standard Entry-Level Technical Engineering Role'}".

Perform a rigorous evaluation covering:
1. Technical skills (found and missing key requirements).
2. Education and practical work experience relevance.
3. Projects and certifications quality.
4. Missing sections or critical gaps.
5. Specific, actionable improvement recommendations.

Resume content:
"""
${resumeText.slice(0, 10000)}
"""

Return a valid JSON object strictly matching this schema:
{
  "atsScore": number (0-100),
  "matchProbability": string,
  "foundKeywords": string[],
  "missingKeywords": string[],
  "skillsAnalysis": {
    "strengths": string[],
    "missingGaps": string[]
  },
  "educationAndExperience": string,
  "projectsEvaluation": string,
  "missingInformation": string[],
  "formattingFeedback": string[],
  "actionableImprovements": string[]
}`;

    // 1. Google Gemini Provider
    if (process.env.GEMINI_API_KEY) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

      const aiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json().catch(() => ({}));
        return res.status(502).json({
          success: false,
          message: `Gemini AI Provider Error: ${errorData.error ? errorData.error.message : aiResponse.statusText}`
        });
      }

      const responseJson = await aiResponse.json();
      const generatedContent = responseJson.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsedAnalysis = JSON.parse(generatedContent);

      return res.status(200).json({
        success: true,
        message: 'Resume analyzed successfully via live Gemini AI engine',
        data: parsedAnalysis
      });
    }

    // 2. OpenAI Provider
    if (process.env.OPENAI_API_KEY) {
      const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an expert ATS resume analyst. Return only valid JSON.' },
            { role: 'user', content: systemPrompt }
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
      message: 'AI provider is not configured. Please set GEMINI_API_KEY or OPENAI_API_KEY in server/.env.'
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
      provider: process.env.GEMINI_API_KEY ? 'Google Gemini 1.5 Flash' : (process.env.OPENAI_API_KEY ? 'OpenAI gpt-4o-mini' : 'None'),
      isConfigured,
      message: isConfigured
        ? 'AI provider is configured and operational.'
        : 'AI provider is not configured. Live AI resume analysis requires GEMINI_API_KEY or OPENAI_API_KEY in server/.env.'
    }
  });
};
