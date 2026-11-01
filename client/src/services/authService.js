import api from './api';

export const authService = {
  // Student registration
  register: (userData) => {
    return api.post('/auth/register', userData);
  },

  // User login (student or admin)
  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },

  // User logout
  logout: () => {
    return api.post('/auth/logout', {});
  },

  // Fetch current authenticated user & profile
  getProfile: () => {
    return api.get('/auth/me');
  },

  // Update student profile
  updateProfile: (profileData) => {
    return api.put('/profiles/me', profileData);
  }
};
