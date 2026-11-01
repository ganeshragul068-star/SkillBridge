const { normalizeSkill } = require('./matchingService');

/**
 * Extracts skill name strings from an array of strings or skill objects
 */
function extractStudentSkillNames(skills) {
  if (!Array.isArray(skills)) return [];
  return skills.map((s) => {
    if (typeof s === 'string') return s;
    return s.name || s.skillName || '';
  }).filter(Boolean);
}

/**
 * Normalizes text for clean substring and token matching
 */
function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Calculates Skill Relevance Score (Weight: 40%)
 * Measures overlap between student's current skills and mentor's technical skills
 * 
 * Formula: (matchedSkillsCount / Math.max(1, Math.min(studentSkillSet.size, mentorSkillSet.size))) * 100
 * Bounded strictly between 0 and 100.
 */
function calculateSkillScore(studentSkills = [], mentorSkills = []) {
  const studentNames = extractStudentSkillNames(studentSkills);
  const studentNormMap = new Map();
  studentNames.forEach((s) => {
    const norm = normalizeSkill(s);
    if (norm) studentNormMap.set(norm, s);
  });

  const mentorNormMap = new Map();
  mentorSkills.forEach((s) => {
    const norm = normalizeSkill(s);
    if (norm) mentorNormMap.set(norm, s);
  });

  if (studentNormMap.size === 0 || mentorNormMap.size === 0) {
    return {
      skillScore: 0,
      matchedSkills: []
    };
  }

  const matchedSkills = [];
  studentNormMap.forEach((origStudentSkill, norm) => {
    if (mentorNormMap.has(norm)) {
      matchedSkills.push(origStudentSkill);
    }
  });

  // Overlap base: bounded by the minimum meaningful skill scope
  const overlapBase = Math.min(studentNormMap.size, Math.max(1, mentorNormMap.size));
  const rawScore = (matchedSkills.length / Math.max(1, overlapBase)) * 100;
  const skillScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  return {
    skillScore,
    matchedSkills
  };
}

/**
 * Calculates Career Interest Relevance Score (Weight: 25%)
 * Compares student's interests / department against mentor's guidance careerDomains
 * 
 * Bounded strictly between 0 and 100.
 */
function calculateInterestScore(studentInterests = [], mentorDomains = [], studentDepartment = '') {
  const normMentorDomains = (Array.isArray(mentorDomains) ? mentorDomains : []).map(normalizeText).filter(Boolean);
  
  if (normMentorDomains.length === 0) {
    return {
      interestScore: 0,
      matchedDomains: []
    };
  }

  const rawInterests = Array.isArray(studentInterests) ? studentInterests.filter(Boolean) : [];
  const normStudentInterests = rawInterests.map(normalizeText).filter(Boolean);

  if (normStudentInterests.length === 0) {
    // Graceful fallback to department alignment when student has not yet specified interests
    if (studentDepartment && studentDepartment.trim()) {
      const normDept = normalizeText(studentDepartment);
      const deptMatches = mentorDomains.filter((d) => {
        const nd = normalizeText(d);
        return nd.includes(normDept) || normDept.includes(nd) ||
          (normDept.includes('computer') || normDept.includes('information'));
      });
      if (deptMatches.length > 0) {
        return {
          interestScore: 60,
          matchedDomains: deptMatches
        };
      }
    }
    return {
      interestScore: 50,
      matchedDomains: [mentorDomains[0] || 'Software Engineering']
    };
  }

  const matchedDomains = [];
  mentorDomains.forEach((origDomain) => {
    const normDom = normalizeText(origDomain);
    const hasMatch = normStudentInterests.some((intText) => {
      return normDom.includes(intText) || intText.includes(normDom);
    });

    if (hasMatch) {
      matchedDomains.push(origDomain);
    }
  });

  // Calculate score based on proportion of student interests satisfied by mentor's domains
  let satisfiedInterestsCount = 0;
  normStudentInterests.forEach((intText) => {
    const isCovered = normMentorDomains.some((normDom) => {
      return normDom.includes(intText) || intText.includes(normDom);
    });
    if (isCovered) satisfiedInterestsCount += 1;
  });

  const rawScore = (satisfiedInterestsCount / Math.max(1, normStudentInterests.length)) * 100;
  const interestScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  return {
    interestScore,
    matchedDomains
  };
}

/**
 * Calculates Missing Skill Guidance Score (Weight: 20%)
 * Measures mentor's ability to help student overcome identified skill gaps
 * Compares student missing skills against mentor's areasOfExpertise and technicalSkills
 * 
 * Bounded strictly between 0 and 100.
 */
function calculateGuidanceScore(missingSkills = [], mentorExpertise = [], mentorSkills = []) {
  if (!Array.isArray(missingSkills) || missingSkills.length === 0) {
    // If student has no identified gaps, mentor provides advanced domain guidance
    return {
      guidanceScore: 100,
      guidanceSkills: []
    };
  }

  // Build lookup of normalized mentor expertise & technical skills
  const mentorCapabilitySet = new Set();
  
  (Array.isArray(mentorSkills) ? mentorSkills : []).forEach((s) => {
    const norm = normalizeSkill(s);
    if (norm) mentorCapabilitySet.add(norm);
    const normTxt = normalizeText(s);
    if (normTxt) mentorCapabilitySet.add(normTxt);
  });

  (Array.isArray(mentorExpertise) ? mentorExpertise : []).forEach((e) => {
    const normTxt = normalizeText(e);
    if (normTxt) mentorCapabilitySet.add(normTxt);
    // Also add individual tokens
    normTxt.split(' ').forEach((tok) => {
      if (tok.length > 2) mentorCapabilitySet.add(tok);
    });
  });

  const guidanceSkills = [];
  missingSkills.forEach((missSkill) => {
    const norm = normalizeSkill(missSkill);
    const normTxt = normalizeText(missSkill);

    let canGuide = mentorCapabilitySet.has(norm) || mentorCapabilitySet.has(normTxt);
    if (!canGuide) {
      // Check partial token overlap
      for (const cap of mentorCapabilitySet) {
        if (cap.includes(normTxt) || normTxt.includes(cap)) {
          canGuide = true;
          break;
        }
      }
    }

    if (canGuide) {
      guidanceSkills.push(missSkill);
    }
  });

  const rawScore = (guidanceSkills.length / Math.max(1, missingSkills.length)) * 100;
  const guidanceScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  return {
    guidanceScore,
    guidanceSkills
  };
}

/**
 * Calculates Desired Job Role Relevance Score (Weight: 15%)
 * Compares student's desired job role against mentor's title, experience, and domains
 * 
 * Bounded strictly between 0 and 100.
 */
function calculateRoleScore(desiredRole = '', mentorTitle = '', mentorExperience = 1, mentorDomains = []) {
  const normRole = normalizeText(desiredRole);
  const normTitle = normalizeText(mentorTitle);
  const normDomains = (Array.isArray(mentorDomains) ? mentorDomains : []).map(normalizeText);

  // Role keyword overlap
  let baseScore = 20; // default baseline for professional alignment

  if (normRole) {
    const roleTokens = normRole.split(' ').filter((t) => t.length > 2 && t !== 'developer' && t !== 'engineer');
    let matchedTokens = 0;

    // Direct substring match
    if (normTitle.includes(normRole) || normRole.includes(normTitle)) {
      baseScore = 70;
    } else {
      roleTokens.forEach((tok) => {
        if (normTitle.includes(tok) || normDomains.some((d) => d.includes(tok))) {
          matchedTokens += 1;
        }
      });

      if (roleTokens.length > 0 && matchedTokens > 0) {
        baseScore = 30 + Math.round((matchedTokens / roleTokens.length) * 40);
      }
    }
  } else {
    baseScore = 50;
  }

  // Experience bonus: up to 30 points (3 points per year of experience, capped at 10 years = 30 pts)
  const expBonus = Math.min(30, Math.max(5, (mentorExperience || 1) * 3));
  const roleScore = Math.min(100, Math.max(0, Math.round(baseScore + expBonus)));

  return {
    roleScore,
    roleRelevance: `${mentorTitle} (${mentorExperience} yrs exp) aligns with desired role '${desiredRole || 'Software Professional'}'`
  };
}

/**
 * Core Mentor Matching Function
 * 
 * Final Match Score =
 *   (Skill Score × 0.40) +
 *   (Interest Score × 0.25) +
 *   (Guidance Score × 0.20) +
 *   (Role Score × 0.15)
 * 
 * @param {object} studentContext
 *   - currentSkills: Array of skill strings or skill objects
 *   - missingSkills: Array of skill strings
 *   - careerInterests: Array of interest strings
 *   - desiredRole: String
 *   - department: String
 * @param {object} mentor
 *   - _id, name, title, company, industry, yearsOfExperience, technicalSkills, areasOfExpertise, careerDomains
 * @returns {object} Match result with breakdown, explanation, and final score
 */
function calculateMentorMatch(studentContext = {}, mentor = {}) {
  const {
    currentSkills = [],
    missingSkills = [],
    careerInterests = [],
    desiredRole = 'Full Stack Developer',
    department = ''
  } = studentContext;

  const mentorSkills = Array.isArray(mentor.technicalSkills) ? mentor.technicalSkills : [];
  const mentorExpertise = Array.isArray(mentor.areasOfExpertise) ? mentor.areasOfExpertise : [];
  const mentorDomains = Array.isArray(mentor.careerDomains) ? mentor.careerDomains : [];

  // 1. Skill Score (40%)
  const { skillScore, matchedSkills } = calculateSkillScore(currentSkills, mentorSkills);

  // 2. Interest Score (25%)
  const { interestScore, matchedDomains } = calculateInterestScore(careerInterests, mentorDomains, department);

  // 3. Guidance Score (20%)
  const { guidanceScore, guidanceSkills } = calculateGuidanceScore(missingSkills, mentorExpertise, mentorSkills);

  // 4. Role Score (15%)
  const { roleScore, roleRelevance } = calculateRoleScore(desiredRole, mentor.title, mentor.yearsOfExperience, mentorDomains);

  // Weighted Final Score
  const rawFinal = (skillScore * 0.40) + (interestScore * 0.25) + (guidanceScore * 0.20) + (roleScore * 0.15);
  const finalScore = Math.min(100, Math.max(0, Math.round(rawFinal)));

  // Explainability summary
  let reason = '';
  if (finalScore >= 75) {
    reason = `Outstanding ${finalScore}% match: shares ${matchedSkills.length} of your current skills and can guide your skill gaps in ${guidanceSkills.length > 0 ? guidanceSkills.join(', ') : mentorDomains[0] || 'advanced architecture'}.`;
  } else if (finalScore >= 50) {
    reason = `Strong ${finalScore}% match: aligns well with your ${desiredRole} target and offers expertise in ${mentorExpertise.slice(0, 2).join(' & ')}.`;
  } else {
    reason = `Relevant ${finalScore}% match: provides valuable professional perspective in ${mentor.industry}.`;
  }

  return {
    mentorId: mentor._id,
    mentorName: mentor.name,
    title: mentor.title,
    company: mentor.company,
    industry: mentor.industry,
    profileImage: mentor.profileImage || '',
    yearsOfExperience: mentor.yearsOfExperience,
    availability: mentor.availability,
    preferredMode: mentor.preferredMode,
    matchScore: finalScore,
    scoreBreakdown: {
      skillScore,
      interestScore,
      guidanceScore,
      roleScore,
      weights: {
        skill: '40%',
        interest: '25%',
        guidance: '20%',
        role: '15%'
      }
    },
    matchingSkills: matchedSkills,
    guidanceSkills,
    matchingDomains: matchedDomains,
    roleRelevance,
    recommendationReason: reason
  };
}

/**
 * Ranks all active mentors for a student
 * 
 * @param {object} studentContext
 * @param {Array<object>} mentorsList
 * @returns {Array<object>} Sorted recommendations
 */
function rankMentorsForStudent(studentContext = {}, mentorsList = []) {
  if (!Array.isArray(mentorsList) || mentorsList.length === 0) {
    return [];
  }

  const activeMentors = mentorsList.filter((m) => m && m.isActive !== false);

  const scoredMentors = activeMentors.map((mentor) => {
    const match = calculateMentorMatch(studentContext, mentor);
    return {
      mentor: {
        _id: mentor._id,
        name: mentor.name,
        title: mentor.title,
        company: mentor.company,
        industry: mentor.industry,
        yearsOfExperience: mentor.yearsOfExperience,
        technicalSkills: mentor.technicalSkills,
        areasOfExpertise: mentor.areasOfExpertise,
        careerDomains: mentor.careerDomains,
        bio: mentor.bio,
        availability: mentor.availability,
        preferredMode: mentor.preferredMode,
        profileImage: mentor.profileImage,
        isActive: mentor.isActive
      },
      ...match
    };
  });

  // Sort descending by matchScore
  scoredMentors.sort((a, b) => b.matchScore - a.matchScore);

  return scoredMentors;
}

module.exports = {
  calculateSkillScore,
  calculateInterestScore,
  calculateGuidanceScore,
  calculateRoleScore,
  calculateMentorMatch,
  rankMentorsForStudent
};
