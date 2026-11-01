/**
 * SkillBridge Smart Job Matching & Skill Intelligence Service
 * 
 * Provides:
 * 1. Skill name normalization & canonical alias resolution
 * 2. Explainable Job-Skill Matching calculation (formula: matched / total * 100)
 * 3. Skill-Gap analysis with assessment verification checks and priority scoring
 * 4. Course recommendation engine with relevance ranking & duplicate prevention
 * 5. Dependency-ordered personalized learning roadmap generation
 */

// Skill aliases mapping to canonical representations
const SKILL_ALIASES = {
  // JavaScript & TypeScript
  'js': 'javascript',
  'javascript': 'javascript',
  'es6': 'javascript',
  'ecmascript': 'javascript',
  'ts': 'typescript',
  'typescript': 'typescript',

  // Frontend Frameworks & Libraries
  'react': 'react.js',
  'reactjs': 'react.js',
  'react.js': 'react.js',
  'react js': 'react.js',
  'next': 'next.js',
  'nextjs': 'next.js',
  'next.js': 'next.js',
  'vue': 'vue.js',
  'vuejs': 'vue.js',
  'vue.js': 'vue.js',
  'angular': 'angular',
  'angularjs': 'angular',
  'redux': 'redux',
  'redux toolkit': 'redux',

  // Backend Frameworks & Runtimes
  'node': 'node.js',
  'nodejs': 'node.js',
  'node.js': 'node.js',
  'node js': 'node.js',
  'express': 'express.js',
  'expressjs': 'express.js',
  'express.js': 'express.js',
  'express js': 'express.js',
  'nest': 'nest.js',
  'nestjs': 'nest.js',
  'nest.js': 'nest.js',
  'django': 'django',
  'flask': 'flask',
  'spring': 'spring boot',
  'spring boot': 'spring boot',
  'springboot': 'spring boot',

  // Databases & Storage
  'mongo': 'mongodb',
  'mongodb': 'mongodb',
  'postgres': 'postgresql',
  'postgresql': 'postgresql',
  'postgres db': 'postgresql',
  'mysql': 'mysql',
  'redis': 'redis',
  'sql': 'sql',

  // DevOps & Cloud
  'k8s': 'kubernetes',
  'kubernetes': 'kubernetes',
  'docker': 'docker',
  'docker container': 'docker',
  'aws': 'amazon web services',
  'amazon web services': 'amazon web services',
  'gcp': 'google cloud',
  'google cloud': 'google cloud',
  'azure': 'microsoft azure',
  'ci/cd': 'ci/cd',
  'cicd': 'ci/cd',

  // Programming Languages
  'golang': 'go',
  'go': 'go',
  'py': 'python',
  'python': 'python',
  'java': 'java', // Intentionally distinct from javascript
  'cpp': 'c++',
  'c++': 'c++',
  'csharp': 'c#',
  'c#': 'c#',

  // Web Standards & APIs
  'html': 'html5',
  'html5': 'html5',
  'css': 'css3',
  'css3': 'css3',
  'tailwind': 'tailwind css',
  'tailwindcss': 'tailwind css',
  'tailwind css': 'tailwind css',
  'bootstrap': 'bootstrap',
  'rest': 'rest apis',
  'rest api': 'rest apis',
  'rest apis': 'rest apis',
  'restful apis': 'rest apis',
  'restful api': 'rest apis',
  'graphql': 'graphql',

  // Version Control & Tools
  'git': 'git',
  'github': 'git'
};

// Foundational skill ranks (lower number = more foundational, must be learned first)
const FOUNDATIONAL_RANKS = {
  'html5': 1,
  'css3': 1,
  'javascript': 1,
  'python': 1,
  'java': 1,
  'c++': 1,
  'c#': 1,
  'sql': 1,
  'git': 2,
  'typescript': 2,
  'node.js': 2,
  'linux': 2,
  'react.js': 3,
  'vue.js': 3,
  'express.js': 3,
  'mongodb': 3,
  'postgresql': 3,
  'mysql': 3,
  'rest apis': 3,
  'redux': 4,
  'next.js': 4,
  'docker': 4,
  'graphql': 4,
  'aws': 5,
  'amazon web services': 5,
  'kubernetes': 5,
  'ci/cd': 5
};

// Standard career roles & standard skill requirement sets
const CAREER_ROLE_PRESETS = {
  'Full Stack MERN Developer': [
    'JavaScript', 'React.js', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'Git', 'HTML5', 'CSS3'
  ],
  'MERN Stack Developer': [
    'JavaScript', 'React.js', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'Git'
  ],
  'Frontend Developer': [
    'HTML5', 'CSS3', 'JavaScript', 'React.js', 'Redux', 'Git', 'Tailwind CSS', 'TypeScript'
  ],
  'Backend Developer': [
    'Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'SQL', 'Git', 'Docker', 'PostgreSQL'
  ],
  'DevOps Engineer': [
    'Docker', 'Kubernetes', 'Linux', 'AWS', 'CI/CD', 'Git', 'Python'
  ],
  'Data Analyst': [
    'Python', 'SQL', 'Data Visualization', 'Git', 'PostgreSQL'
  ],
  'Mobile App Developer': [
    'JavaScript', 'React.js', 'TypeScript', 'REST APIs', 'Git'
  ]
};

/**
 * Normalize skill string (trims, lowercases, handles punctuation and resolves aliases)
 * Strictly preserves distinctions between different technologies (e.g. Java !== JavaScript).
 */
function normalizeSkill(skill) {
  if (!skill || typeof skill !== 'string') return '';
  const cleaned = skill
    .trim()
    .toLowerCase()
    .replace(/[\s\-_]+/g, ' ');

  return SKILL_ALIASES[cleaned] || cleaned;
}

/**
 * Get foundational order ranking for a skill
 */
function getSkillFoundationalRank(skill) {
  const norm = normalizeSkill(skill);
  return FOUNDATIONAL_RANKS[norm] || 3; // Default to mid-level
}

/**
 * Determine match tier based on percentage
 */
function getMatchTier(percentage) {
  if (percentage >= 80) return 'Excellent';
  if (percentage >= 60) return 'Good';
  if (percentage >= 40) return 'Moderate';
  return 'Low';
}

/**
 * Extract student skill names from profile
 */
function extractStudentSkillNames(skills) {
  if (!Array.isArray(skills)) return [];
  return skills.map((s) => {
    if (typeof s === 'string') return s;
    return s.name || '';
  }).filter(Boolean);
}

/**
 * Core Job-Skill Matching Algorithm
 * 
 * Formula: Match Percentage = (matchedRequiredSkills / totalRequiredSkills) * 100
 * 
 * @param {Array<string|object>} studentSkills - Student's profile skills
 * @param {Array<string>} requiredSkills - Job's required skills
 * @returns {object} Matching metrics (percentage, matchedSkills, missingSkills, tier)
 */
function calculateJobMatch(studentSkills = [], requiredSkills = []) {
  // Normalize student skills into a lookup map & set
  const studentSkillNames = extractStudentSkillNames(studentSkills);
  const normalizedStudentMap = new Map();

  studentSkillNames.forEach((s) => {
    const norm = normalizeSkill(s);
    if (norm) {
      normalizedStudentMap.set(norm, s);
    }
  });

  // Handle jobs with empty required skills gracefully
  if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
    return {
      matchPercentage: 100,
      matchedCount: 0,
      totalRequired: 0,
      matchedSkills: [],
      missingSkills: [],
      matchTier: 'Excellent',
      isFullyQualified: true,
      explanation: 'This opportunity has no strict skill prerequisites; 100% match.'
    };
  }

  const matchedSkills = [];
  const missingSkills = [];

  requiredSkills.forEach((reqSkill) => {
    const trimmedReq = typeof reqSkill === 'string' ? reqSkill.trim() : '';
    if (!trimmedReq) return;

    const normReq = normalizeSkill(trimmedReq);
    if (normalizedStudentMap.has(normReq)) {
      matchedSkills.push(trimmedReq);
    } else {
      missingSkills.push(trimmedReq);
    }
  });

  const totalRequired = requiredSkills.length;
  const matchedCount = matchedSkills.length;
  const matchPercentage = totalRequired > 0
    ? Math.round((matchedCount / totalRequired) * 100)
    : 100;

  const matchTier = getMatchTier(matchPercentage);

  return {
    matchPercentage,
    matchedCount,
    totalRequired,
    matchedSkills,
    missingSkills,
    matchTier,
    isFullyQualified: matchedCount === totalRequired,
    explanation: `Matches ${matchedCount} of ${totalRequired} required skills (${matchPercentage}%).`
  };
}

/**
 * Skill-Gap Analysis for a target role or job
 * 
 * @param {Array<string|object>} studentSkills - Student profile skills
 * @param {Array<string>} targetRequiredSkills - Target role/job required skills
 * @param {Array<string>} verifiedSkills - Skills verified through passed assessments
 * @param {string} targetName - Target job title or role name
 */
function calculateSkillGap(studentSkills = [], targetRequiredSkills = [], verifiedSkills = [], targetName = 'Target Role') {
  const matchResult = calculateJobMatch(studentSkills, targetRequiredSkills);

  // Normalize verified skills set
  const verifiedSet = new Set((verifiedSkills || []).map((v) => normalizeSkill(v)));

  // Enrich matched skills with verification status
  const matchedDetails = matchResult.matchedSkills.map((skillName) => {
    const norm = normalizeSkill(skillName);
    const isVerified = verifiedSet.has(norm);
    return {
      name: skillName,
      isVerified,
      verificationSource: isVerified ? 'SkillBridge Assessment' : 'Self-Reported Profile'
    };
  });

  // Enrich missing skills with foundational ranking and priority
  const missingDetails = matchResult.missingSkills.map((skillName) => {
    const rank = getSkillFoundationalRank(skillName);
    let priority = 'Medium';
    if (rank <= 2) priority = 'High';
    else if (rank >= 5) priority = 'Low';

    return {
      name: skillName,
      priority,
      foundationalRank: rank,
      reason: rank <= 2
        ? `Foundational prerequisite for ${targetName}`
        : `Core technical capability required for ${targetName}`
    };
  }).sort((a, b) => a.foundationalRank - b.foundationalRank);

  return {
    targetName,
    matchPercentage: matchResult.matchPercentage,
    matchTier: matchResult.matchTier,
    matchedCount: matchResult.matchedCount,
    totalRequired: matchResult.totalRequired,
    matchedSkills: matchedDetails,
    missingSkills: missingDetails,
    isFullyQualified: matchResult.isFullyQualified,
    totalMissing: missingDetails.length
  };
}

/**
 * Course Recommendation Engine
 * 
 * Compares missing skills against active course catalog
 * 
 * @param {Array<string>} missingSkills - Missing skill names
 * @param {Array<object>} availableCourses - Active courses from DB
 * @param {string} studentLevel - Student proficiency level
 * @returns {Array<object>} Recommended courses with explainability and relevance ranking
 */
function recommendCourses(missingSkills = [], availableCourses = [], studentLevel = 'Beginner') {
  if (!Array.isArray(missingSkills) || missingSkills.length === 0) {
    return [];
  }

  // Normalize missing skills into a Map
  const missingMap = new Map();
  missingSkills.forEach((s) => {
    const norm = normalizeSkill(s);
    if (norm) missingMap.set(norm, s);
  });

  const recommendations = [];
  const coveredSkillNorms = new Set();

  availableCourses.forEach((course) => {
    if (!course.isActive) return;

    const matchedMissing = [];
    const courseSkills = Array.isArray(course.skillsCovered) ? course.skillsCovered : [];

    courseSkills.forEach((cSkill) => {
      const norm = normalizeSkill(cSkill);
      if (missingMap.has(norm)) {
        matchedMissing.push(missingMap.get(norm));
        coveredSkillNorms.add(norm);
      }
    });

    if (matchedMissing.length > 0) {
      // Relevance scoring
      let relevanceScore = matchedMissing.length * 10;
      if (course.difficulty === studentLevel) relevanceScore += 5;
      if (course.difficulty === 'Beginner') relevanceScore += 3;

      recommendations.push({
        _id: course._id,
        title: course.title,
        provider: course.provider,
        description: course.description,
        difficulty: course.difficulty,
        duration: course.duration,
        courseUrl: course.courseUrl,
        skillsCovered: course.skillsCovered,
        addressedMissingSkills: matchedMissing,
        relevanceScore,
        recommendationReason: `Addresses your missing skill${matchedMissing.length > 1 ? 's' : ''}: ${matchedMissing.join(', ')}`
      });
    }
  });

  // Sort by relevance score descending
  recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return recommendations;
}

/**
 * Generate Personalized Learning Roadmap Steps
 * Orders missing skills by foundational hierarchy so foundational skills precede dependent ones.
 * 
 * @param {Array<string>} missingSkills - Missing skill names
 * @param {string} targetRole - Target career role
 * @param {Array<object>} availableCourses - Active courses to link
 */
function generateRoadmap(missingSkills = [], targetRole = 'Target Role', availableCourses = []) {
  if (!Array.isArray(missingSkills) || missingSkills.length === 0) {
    return {
      targetRole,
      steps: [],
      totalSteps: 0,
      completionPercentage: 100,
      message: `You currently possess all required skills for ${targetRole}! You are ready to apply.`
    };
  }

  // Sort missing skills by foundational rank
  const sortedMissing = [...missingSkills].sort((a, b) => {
    return getSkillFoundationalRank(a) - getSkillFoundationalRank(b);
  });

  const steps = sortedMissing.map((skillName, index) => {
    const rank = getSkillFoundationalRank(skillName);
    let priority = 'Medium';
    if (rank <= 2) priority = 'High';
    else if (rank >= 5) priority = 'Low';

    // Find courses covering this skill
    const norm = normalizeSkill(skillName);
    const linkedCourses = availableCourses
      .filter((c) => c.isActive && Array.isArray(c.skillsCovered) && c.skillsCovered.some((cs) => normalizeSkill(cs) === norm))
      .map((c) => ({
        _id: c._id,
        title: c.title,
        provider: c.provider,
        difficulty: c.difficulty,
        duration: c.duration,
        courseUrl: c.courseUrl
      }));

    return {
      stepNumber: index + 1,
      skill: skillName,
      targetRole,
      priority,
      isFoundational: rank <= 2,
      status: 'not-started', // 'not-started' | 'in-progress' | 'completed'
      progressPercentage: 0,
      recommendedCourses: linkedCourses,
      action: `Master ${skillName} foundational concepts and complete practical projects.`
    };
  });

  return {
    targetRole,
    steps,
    totalSteps: steps.length,
    completionPercentage: 0
  };
}

module.exports = {
  SKILL_ALIASES,
  CAREER_ROLE_PRESETS,
  normalizeSkill,
  getSkillFoundationalRank,
  getMatchTier,
  calculateJobMatch,
  calculateSkillGap,
  recommendCourses,
  generateRoadmap
};
