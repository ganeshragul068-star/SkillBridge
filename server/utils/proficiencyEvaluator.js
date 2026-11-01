/**
 * Skill Proficiency Evaluation Service
 * 
 * Classifies student technical proficiency based on objective assessment percentage
 * Configurable thresholds:
 * - Below 40%: Needs Improvement
 * - 40–59%: Beginner
 * - 60–79%: Intermediate
 * - 80–89%: Advanced
 * - 90–100%: Expert
 */

const PROFICIENCY_THRESHOLDS = {
  EXPERT: 90,
  ADVANCED: 80,
  INTERMEDIATE: 60,
  BEGINNER: 40
};

/**
 * Classify proficiency level from percentage score
 */
function evaluateProficiency(percentage = 0) {
  const score = Number(percentage);
  if (score >= PROFICIENCY_THRESHOLDS.EXPERT) return 'Expert';
  if (score >= PROFICIENCY_THRESHOLDS.ADVANCED) return 'Advanced';
  if (score >= PROFICIENCY_THRESHOLDS.INTERMEDIATE) return 'Intermediate';
  if (score >= PROFICIENCY_THRESHOLDS.BEGINNER) return 'Beginner';
  return 'Needs Improvement';
}

/**
 * Generate actionable feedback based on performance
 */
function getProficiencyFeedback(proficiencyLevel, skill) {
  switch (proficiencyLevel) {
    case 'Expert':
      return `Outstanding mastery of ${skill}! You demonstrate enterprise-grade competence suitable for senior technical roles.`;
    case 'Advanced':
      return `Strong technical capability in ${skill}. You have solid architectural and implementation knowledge.`;
    case 'Intermediate':
      return `Good foundational command of ${skill}. Focus on advanced patterns, edge cases, and performance optimization to reach top tier.`;
    case 'Beginner':
      return `Basic understanding of ${skill}. Recommended to complete curated courses and hands-on laboratory exercises to solidify fundamentals.`;
    case 'Needs Improvement':
    default:
      return `Early stages in ${skill}. We strongly recommend following our step-by-step roadmap to build foundational understanding.`;
  }
}

module.exports = {
  PROFICIENCY_THRESHOLDS,
  evaluateProficiency,
  getProficiencyFeedback
};
