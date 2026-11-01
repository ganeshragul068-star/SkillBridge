import api from './api';

export const assessmentService = {
  // Get active assessments with filtering
  getAssessments: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '' && val !== null) {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    const res = await api.get(`/assessments${qs ? `?${qs}` : ''}`);
    return res;
  },

  // Get single assessment details for preview
  getAssessmentById: async (id) => {
    const res = await api.get(`/assessments/${id}`);
    return res;
  },

  // Start assessment attempt session
  startAssessment: async (id) => {
    const res = await api.post(`/assessments/${id}/start`);
    return res;
  },

  // Get active attempt state
  getAssessmentAttempt: async (attemptId) => {
    const res = await api.get(`/assessment-attempts/${attemptId}`);
    return res;
  },

  // Submit attempt answers for backend scoring
  submitAssessmentAttempt: async (attemptId, payload) => {
    const res = await api.post(`/assessment-attempts/${attemptId}/submit`, payload);
    return res;
  },

  // Student's assessment history
  getMyAssessmentResults: async () => {
    const res = await api.get('/assessment-results/my');
    return res;
  },

  // Get single result with review breakdown & explanations
  getAssessmentResultById: async (id) => {
    const res = await api.get(`/assessment-results/${id}`);
    return res;
  },

  // Admin Management Endpoints
  createAssessment: async (data) => {
    const res = await api.post('/admin/assessments', data);
    return res;
  },

  updateAssessment: async (id, data) => {
    const res = await api.put(`/admin/assessments/${id}`, data);
    return res;
  },

  deleteAssessment: async (id) => {
    const res = await api.delete(`/admin/assessments/${id}`);
    return res;
  },

  getAssessmentStats: async () => {
    const res = await api.get('/admin/assessments/stats');
    return res;
  }
};

export default assessmentService;
