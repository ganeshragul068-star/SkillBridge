import api from './api';

export const progressService = {
  // Get all learning progress records for student
  getProgress: async () => {
    const res = await api.get('/progress');
    return res;
  },

  // Create new skill progress record
  createProgress: async (data) => {
    const res = await api.post('/progress', data);
    return res;
  },

  // Update progress, proficiency level, or start/complete course
  updateProgress: async (id, data) => {
    const res = await api.put(`/progress/${id}`, data);
    return res;
  },

  // Delete progress record
  deleteProgress: async (id) => {
    const res = await api.delete(`/progress/${id}`);
    return res;
  },

  // Get aggregated dashboard & learning analytics
  getProgressDashboard: async () => {
    const res = await api.get('/progress/dashboard');
    return res;
  }
};

export default progressService;
