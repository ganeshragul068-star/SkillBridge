/**
 * Reusable Google Gemini Service for SkillBridge
 * Centralized, secure backend-only integration for Gemini 2.5 Flash
 */

const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite'];

/**
 * Check if Gemini API key is configured
 */
function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
}

/**
 * Execute raw Gemini prompt with JSON or Text generation
 */
async function callGemini({ systemInstruction, userPrompt, responseJson = true }) {
  if (!isGeminiConfigured()) {
    const error = new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in server/.env.');
    error.status = 503;
    error.code = 'GEMINI_NOT_CONFIGURED';
    throw error;
  }

  const apiKey = process.env.GEMINI_API_KEY.trim();
  let lastError = null;

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const contents = [];
      if (systemInstruction) {
        contents.push({ role: 'user', parts: [{ text: `System Instruction:\n${systemInstruction}` }] });
        contents.push({ role: 'model', parts: [{ text: 'Understood. I will strictly follow these instructions.' }] });
      }
      contents.push({ role: 'user', parts: [{ text: userPrompt }] });

      const bodyPayload = {
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2500
        }
      };

      if (responseJson) {
        bodyPayload.generationConfig.responseMimeType = 'application/json';
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMessage = errorData.error?.message || response.statusText;
        lastError = new Error(`Gemini API [${model}] error (${response.status}): ${errMessage}`);
        lastError.status = response.status === 429 ? 429 : 502;
        // If 404 on model, try next model
        if (response.status === 404) continue;
        throw lastError;
      }

      const resData = await response.json();
      const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText || !rawText.trim()) {
        throw new Error('Gemini returned an empty response.');
      }

      if (responseJson) {
        // Strip markdown code fences if model returned them
        const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        return JSON.parse(cleaned);
      }

      return rawText.trim();
    } catch (err) {
      lastError = err;
      if (err.status === 404) continue;
      throw err;
    }
  }

  throw lastError || new Error('All Gemini model endpoints failed.');
}

/**
 * Generate ATS-Optimized Professional Summaries based on genuine student profile
 */
async function generateProfessionalSummary({ fullName, targetRole, skills = [], education = [], experience = [], projects = [] }) {
  const prompt = `Act as an expert technical resume writer.
Generate 3 professional summary options (1: Concise ATS-focused, 2: Technical & Project-oriented, 3: Career Objective for College Freshers/Grads) for:
- Student Name: ${fullName || 'Student'}
- Target Role: ${targetRole || 'Full Stack Developer'}
- Technical Skills: ${skills.map(s => typeof s === 'string' ? s : s.name).join(', ') || 'Web Development'}
- Education: ${education.map(e => `${e.degree || 'Degree'} at ${e.institution || 'University'}`).join('; ') || 'Undergraduate'}
- Projects: ${projects.map(p => `${p.title}: ${p.description || ''}`).join('; ') || 'Academic Projects'}

STRICT RULES:
1. NEVER fabricate or invent work experience, employers, GPA/marks, or skills not listed above.
2. Highlight genuine strengths with strong action verbs and clean ATS wording.
3. Keep each summary within 3-4 impactful sentences.

Return JSON strictly matching this schema:
{
  "options": [
    {
      "type": "Concise ATS",
      "text": "..."
    },
    {
      "type": "Technical & Project Focused",
      "text": "..."
    },
    {
      "type": "Objective Statement",
      "text": "..."
    }
  ],
  "recommendedKeywords": ["..."]
}`;

  return await callGemini({
    systemInstruction: 'You are an ATS resume optimization engine. Return strictly valid JSON.',
    userPrompt: prompt,
    responseJson: true
  });
}

/**
 * Improve Project Descriptions into Action-Verb Bullet Points
 */
async function improveProjectBulletPoints({ title, description, technologies = [], existingPoints = [] }) {
  const prompt = `Act as a senior technical recruiter and engineer.
Transform this project description into 3 to 4 high-impact, ATS-optimized bullet points using the STAR methodology (Action verb + Task/Context + Technical implementation + Result/Benefit):

- Project Title: ${title || 'Technical Project'}
- Technologies: ${technologies.join(', ') || 'Software Engineering'}
- Existing Description: ${description || 'Developed web application'}
- Draft Points: ${existingPoints.join('; ')}

STRICT RULES:
1. DO NOT invent false metrics or fake commercial clients.
2. Use active verbs (Engineered, Architected, Designed, Implemented, Integrated, Deployed, Benchmarked).
3. Emphasize clean architecture, responsiveness, REST APIs, or state management based on the technologies.

Return JSON strictly matching this schema:
{
  "bulletPoints": [
    "...",
    "...",
    "..."
  ],
  "improvedDescription": "...",
  "suggestedTags": ["..."]
}`;

  return await callGemini({
    systemInstruction: 'You are an ATS resume bullet point specialist. Return strictly valid JSON.',
    userPrompt: prompt,
    responseJson: true
  });
}

/**
 * Comprehensive AI Resume Analysis with ATS Scoring
 */
async function analyzeResumeContent({ resumeText, targetRole, jobDescription, customRequirements = [] }) {
  const prompt = `You are a certified ATS (Applicant Tracking System) recruiter and technical hiring auditor.
Perform an in-depth ATS compatibility audit on the following candidate resume.

Target Role: "${targetRole || 'Full Stack Developer'}"
Target Job Description / Requirements:
"""
${jobDescription || customRequirements.join(', ') || 'Entry-Level Software Engineering and Development'}
"""

Resume Raw Text:
"""
${resumeText.slice(0, 12000)}
"""

AUDIT REQUIREMENTS:
1. Score the resume across 7 distinct categories (0-100 each) and explain WHY:
   - formattingReadability: Layout simplicity, standard headings, single-column parseability.
   - skillsRelevance: Alignment with target technical competencies.
   - projectDescriptions: Action verbs, context, technical clarity.
   - educationCompleteness: Degree, university, dates.
   - experienceDetails: Practical work, internships, or academic responsibilities.
   - keywordOptimization: Frequency and natural placement of core role keywords.
   - contentQuality: Grammar, spelling, tone, and conciseness.
2. Calculate overall ATS Score (weighted 0-100).
3. Do NOT present score as a guarantee of hiring.
4. Identify strengths, weak sections, missing information, missing keywords, and specific tailored improvements.
5. If a job description was provided, compare required vs matching vs missing skills.

Return JSON strictly matching this schema:
{
  "atsScore": number (0-100),
  "categoryScores": {
    "formattingReadability": { "score": number, "explanation": "string" },
    "skillsRelevance": { "score": number, "explanation": "string" },
    "projectDescriptions": { "score": number, "explanation": "string" },
    "educationCompleteness": { "score": number, "explanation": "string" },
    "experienceDetails": { "score": number, "explanation": "string" },
    "keywordOptimization": { "score": number, "explanation": "string" },
    "contentQuality": { "score": number, "explanation": "string" }
  },
  "strengths": ["string"],
  "weakSections": ["string"],
  "missingInformation": ["string"],
  "missingKeywords": ["string"],
  "foundKeywords": ["string"],
  "recommendedSkills": ["string"],
  "formattingIssues": ["string"],
  "grammarAndSpellingIssues": ["string"],
  "projectSuggestions": ["string"],
  "summarySuggestion": "string",
  "actionableImprovements": ["string"],
  "jobSpecificComparison": {
    "jobTitle": "string",
    "matchingSkills": ["string"],
    "missingSkills": ["string"],
    "tailoringAdvice": "string"
  }
}`;

  return await callGemini({
    systemInstruction: 'You are an objective ATS resume parser and auditor. Output only valid JSON.',
    userPrompt: prompt,
    responseJson: true
  });
}

module.exports = {
  isGeminiConfigured,
  callGemini,
  generateProfessionalSummary,
  improveProjectBulletPoints,
  analyzeResumeContent
};
