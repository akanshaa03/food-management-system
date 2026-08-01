import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useAuth();

  // If not logged in, redirect to login page
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.toUpperCase();

  // SUPER_ADMIN has master access to all routes (Admin can access every module)
  if (userRole === 'SUPER_ADMIN') {
    return children;
  }

  // Verify if current user role is permitted for this route module
  if (allowedRoles) {
    const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());
    const isAuthorized = normalizedAllowed.includes(userRole);

    if (!isAuthorized) {
      // Prevent cross-role access (Business cannot access NGO, NGO cannot access Business)
      switch (userRole) {
        case 'BUSINESS':
          return <Navigate to="/business/dashboard" replace />;
        case 'NGO':
          return <Navigate to="/ngo/dashboard" replace />;
        default:
          return <Navigate to="/login" replace />;
      }
    }
  }

  return children;
};
