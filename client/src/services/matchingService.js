import api from './api';

export const matchingService = {
  // Get jobs matched against student's skills
  getMatchingJobs: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '' && val !== null) {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    const res = await api.get(`/matching/jobs${qs ? `?${qs}` : ''}`);
    return res;
  },

  // Get matching details for a specific job
  getJobMatch: async (jobId) => {
    const res = await api.get(`/matching/jobs/${jobId}`);
    return res;
  },

  // Get student's overall employability and matching summary
  getMatchingSummary: async () => {
    const res = await api.get('/matching/summary');
    return res;
  },

  // Skill-gap analysis for a specific job
  getJobSkillGap: async (jobId) => {
    const res = await api.get(`/skill-gap/jobs/${jobId}`);
    return res;
  },

  // Skill-gap analysis for a standardized career role
  getRoleSkillGap: async (roleName = 'Full Stack MERN Developer') => {
    const encoded = encodeURIComponent(roleName);
    const res = await api.get(`/skill-gap/role/${encoded}`);
    return res;
  },

  // Course recommendations based on general missing skills for a role
  getCourseRecommendations: async (role = 'Full Stack MERN Developer') => {
    const encoded = encodeURIComponent(role);
    const res = await api.get(`/recommendations/courses?role=${encoded}`);
    return res;
  },

  // Course recommendations tailored to missing skills for a job
  getJobCourseRecommendations: async (jobId) => {
    const res = await api.get(`/recommendations/courses/${jobId}`);
    return res;
  },

  // Get student's personalized learning roadmap
  getRoadmap: async () => {
    const res = await api.get('/roadmap');
    return res;
  },

  // Generate or add to roadmap
  createRoadmap: async (data) => {
    const res = await api.post('/roadmap', data);
    return res;
  },

  // Update progress or status of a roadmap step
  updateRoadmapStep: async (id, data) => {
    const res = await api.put(`/roadmap/${id}`, data);
    return res;
  },

  // Delete a step from roadmap
  deleteRoadmapStep: async (id) => {
    const res = await api.delete(`/roadmap/${id}`);
    return res;
  }
};

export default matchingService;
