import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore authentication session on page load / refresh
  const checkAuth = useCallback(async () => {
    try {
      const response = await authService.getProfile();
      if (response && response.success && response.data) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      // Unauthenticated or token expired
      setUser(null);
      localStorage.removeItem('skillbridge_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login handler
  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    if (response && response.data) {
      const userData = response.data;
      if (userData.token) {
        localStorage.setItem('skillbridge_token', userData.token);
      }
      setUser(userData);
      return userData;
    }
    throw new Error(response.message || 'Login failed');
  };

  // Registration handler
  const register = async (userData) => {
    const response = await authService.register(userData);
    if (response && response.data) {
      const registeredUser = response.data;
      if (registeredUser.token) {
        localStorage.setItem('skillbridge_token', registeredUser.token);
      }
      setUser(registeredUser);
      return registeredUser;
    }
    throw new Error(response.message || 'Registration failed');
  };

  // Logout handler
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout network error:', err);
    } finally {
      localStorage.removeItem('skillbridge_token');
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    role: user ? user.role : null,
    loading,
    login,
    register,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
