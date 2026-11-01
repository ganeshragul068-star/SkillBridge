import api from './api';

export const profileService = {
  // Get current student's full profile & completion metrics
  getProfileMe: async () => {
    const res = await api.get('/profiles/me');
    return res.data;
  },

  // Update personal information
  updateProfileMe: async (profileData) => {
    const res = await api.put('/profiles/me', profileData);
    return res.data;
  },

  // Get aggregated dashboard statistics
  getProfileStats: async () => {
    const res = await api.get('/profiles/stats');
    return res.data;
  },

  // ==========================================
  // Education Nested CRUD
  // ==========================================
  addEducation: async (eduData) => {
    const res = await api.post('/profiles/education', eduData);
    return res.data;
  },

  updateEducation: async (eduId, eduData) => {
    const res = await api.put(`/profiles/education/${eduId}`, eduData);
    return res.data;
  },

  deleteEducation: async (eduId) => {
    const res = await api.delete(`/profiles/education/${eduId}`);
    return res.data;
  },

  // ==========================================
  // Projects Nested CRUD
  // ==========================================
  addProject: async (projectData) => {
    const res = await api.post('/profiles/projects', projectData);
    return res.data;
  },

  updateProject: async (projId, projectData) => {
    const res = await api.put(`/profiles/projects/${projId}`, projectData);
    return res.data;
  },

  deleteProject: async (projId) => {
    const res = await api.delete(`/profiles/projects/${projId}`);
    return res.data;
  },

  // ==========================================
  // Certifications Nested CRUD
  // ==========================================
  addCertification: async (certData) => {
    const res = await api.post('/profiles/certifications', certData);
    return res.data;
  },

  updateCertification: async (certId, certData) => {
    const res = await api.put(`/profiles/certifications/${certId}`, certData);
    return res.data;
  },

  deleteCertification: async (certId) => {
    const res = await api.delete(`/profiles/certifications/${certId}`);
    return res.data;
  }
};

export default profileService;
