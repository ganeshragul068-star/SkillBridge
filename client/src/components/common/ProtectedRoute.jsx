import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingState from './LoadingState';

/**
 * ProtectedRoute: Enforces authentication and role-based permissions
 * @param {Array<string>} allowedRoles Optional array of permitted roles (e.g. ['student'], ['admin'])
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingState message="Verifying session and permissions..." />
      </div>
    );
  }

  // Not logged in -> redirect to login preserving attempted destination
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check: if specific roles required and user's role is not authorized
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // If student attempts to access admin route -> redirect to student dashboard
    if (user.role === 'student') {
      return <Navigate to="/dashboard" replace />;
    }
    // If admin attempts to access student-specific private route -> redirect to admin dashboard
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
