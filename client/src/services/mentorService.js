import api from './api';

const mentorService = {
  // Get AI-recommended mentors for student based on skill gaps & desired role
  getRecommendedMentors: async (role = '') => {
    const query = role ? `?role=${encodeURIComponent(role)}` : '';
    return api.get(`/mentors/recommendations${query}`);
  },

  // Browse all mentors with optional filters (search, skill, industry, experience, mode)
  getAllMentors: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/mentors${query ? `?${query}` : ''}`);
  },

  // Get specific mentor details
  getMentorById: async (id) => {
    return api.get(`/mentors/${id}`);
  },

  // Get in-depth match breakdown for a mentor
  getMentorMatchDetails: async (id, role = '') => {
    const query = role ? `?role=${encodeURIComponent(role)}` : '';
    return api.get(`/mentors/${id}/match-details${query}`);
  },

  // Send a mentorship request to a mentor
  sendMentorshipRequest: async (mentorId, message) => {
    return api.post('/mentorship-requests', { mentorId, message });
  },

  // Get all requests sent by authenticated student
  getMyRequests: async () => {
    return api.get('/mentorship-requests/my');
  },

  // Cancel student's own pending request
  cancelRequest: async (id) => {
    return api.patch(`/mentorship-requests/${id}/cancel`);
  }
};

export default mentorService;
