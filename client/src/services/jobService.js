import api from './api';

export const jobService = {
  // Fetch jobs with search, filtering, sorting and pagination
  getJobs: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '' && val !== null) {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    const res = await api.get(`/jobs${qs ? `?${qs}` : ''}`);
    return res;
  },

  // Fetch job details by ID (includes hasApplied, isSaved, and similar jobs)
  getJobById: async (id) => {
    const res = await api.get(`/jobs/${id}`);
    return res;
  },

  // Fetch recommended jobs based on student skill overlap
  getRecommendedJobs: async () => {
    const res = await api.get('/jobs/recommended');
    return res;
  },

  // Admin: Create new opportunity
  createJob: async (jobData) => {
    const res = await api.post('/jobs', jobData);
    return res;
  },

  // Admin: Update opportunity
  updateJob: async (id, jobData) => {
    const res = await api.put(`/jobs/${id}`, jobData);
    return res;
  },

  // Admin: Delete opportunity
  deleteJob: async (id) => {
    const res = await api.delete(`/jobs/${id}`);
    return res;
  }
};

export default jobService;
