import api from './api';

export const applicationService = {
  // Student submits an application
  applyForJob: async (applicationData) => {
    const res = await api.post('/applications', applicationData);
    return res;
  },

  // Student views all their applications
  getMyApplications: async () => {
    const res = await api.get('/applications/my');
    return res;
  },

  // View application details by ID
  getApplicationById: async (id) => {
    const res = await api.get(`/applications/${id}`);
    return res;
  },

  // Student withdraws their application
  withdrawApplication: async (id) => {
    const res = await api.put(`/applications/${id}/withdraw`);
    return res;
  },

  // Admin views all applications across the platform
  getAdminApplications: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '' && val !== null) {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    const res = await api.get(`/admin/applications${qs ? `?${qs}` : ''}`);
    return res;
  },

  // Admin updates application status
  updateApplicationStatus: async (id, status, notes = '') => {
    const res = await api.put(`/admin/applications/${id}/status`, { status, notes });
    return res;
  }
};

export default applicationService;
