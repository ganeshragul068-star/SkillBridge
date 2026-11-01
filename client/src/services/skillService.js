import api from './api';

export const skillService = {
  // Get all skills of current student (with optional category & search filter)
  getSkills: async (category = '', search = '') => {
    let url = '/skills';
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;

    const res = await api.get(url);
    return res;
  },

  // Add new skill to student profile
  addSkill: async (skillData) => {
    const res = await api.post('/skills', skillData);
    return res;
  },

  // Update existing skill
  updateSkill: async (skillId, skillData) => {
    const res = await api.put(`/skills/${skillId}`, skillData);
    return res;
  },

  // Delete skill from profile
  deleteSkill: async (skillId) => {
    const res = await api.delete(`/skills/${skillId}`);
    return res;
  },

  // Get skill gap analysis comparing student skills with market role
  getSkillGapAnalysis: (targetRole) => {
    return api.get(`/skills/gap-analysis?role=${encodeURIComponent(targetRole)}`);
  },

  // Get curated course recommendations
  getCourseRecommendations: (gapSkills) => {
    return api.post('/skills/recommendations', { gapSkills });
  },

  // Submit skill assessment answers
  submitAssessment: (assessmentId, answers) => {
    return api.post(`/skills/assessments/${assessmentId}/submit`, { answers });
  }
};

export default skillService;
