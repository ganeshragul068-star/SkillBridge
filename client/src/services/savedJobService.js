import api from './api';

export const savedJobService = {
  // Save / bookmark a job
  saveJob: async (jobId) => {
    const res = await api.post(`/saved-jobs/${jobId}`);
    return res;
  },

  // Get student's saved bookmarks
  getMySavedJobs: async () => {
    const res = await api.get('/saved-jobs');
    return res;
  },

  // Remove a job from bookmarks
  removeSavedJob: async (jobId) => {
    const res = await api.delete(`/saved-jobs/${jobId}`);
    return res;
  }
};

export default savedJobService;
