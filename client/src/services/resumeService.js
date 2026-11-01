import api from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const resumeService = {
  // Get template choices (ATS, Modern, Classic)
  getTemplates: async () => {
    return api.get('/resumes/templates');
  },

  // Get all resumes for current student
  getMyResumes: async () => {
    return api.get('/resumes');
  },

  // Get specific resume by ID
  getResumeById: async (id) => {
    return api.get(`/resumes/${id}`);
  },

  // Create a new resume (auto-populating from profile if empty)
  createResume: async (data = {}) => {
    return api.post('/resumes', data);
  },

  // Update existing resume
  updateResume: async (id, data) => {
    return api.put(`/resumes/${id}`, data);
  },

  // Duplicate an existing resume
  duplicateResume: async (id) => {
    return api.post(`/resumes/${id}/duplicate`);
  },

  // Delete resume
  deleteResume: async (id) => {
    return api.delete(`/resumes/${id}`);
  },

  // Export and download PDF
  exportPdf: async (id, template = 'ats') => {
    const token = localStorage.getItem('skillbridge_token');
    const url = `${API_BASE_URL}/resumes/${id}/export-pdf?template=${template}`;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(url, { headers, credentials: 'include' });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Failed to export PDF' }));
      throw new Error(err.message || 'Failed to export PDF');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `SkillBridge_Resume_${template.toUpperCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    return true;
  },

  // Upload and extract text from PDF or DOCX file
  uploadAndExtract: async (file) => {
    const token = localStorage.getItem('skillbridge_token');
    const formData = new FormData();
    formData.append('resume', file);

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetch(`${API_BASE_URL}/resumes/upload-extract`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to extract text from document');
    }
    return data;
  },

  // Compare resume against job requirements
  compareJob: async (data) => {
    return api.post('/resumes/compare-job', data);
  },

  // Get student's analysis history
  getMyAnalyses: async () => {
    return api.get('/resumes/analyses/history');
  },

  // Get specific analysis by ID
  getAnalysisById: async (id) => {
    return api.get(`/resumes/analyses/${id}`);
  },

  // Run live AI analysis (if Gemini/OpenAI key configured)
  analyzeWithAi: async (data) => {
    return api.post('/ai/resume-analysis', data);
  },

  // Check AI provider status
  getAiStatus: async () => {
    return api.get('/ai/status');
  }
};

export default resumeService;
