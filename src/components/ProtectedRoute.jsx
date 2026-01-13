import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, hasRole } from '../utils/api';

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication and/or specific roles
 * 
 * @param {React.ReactNode} children - The component to render if authorized
 * @param {Array<string>} allowedRoles - Array of roles that can access this route (e.g., ['admin', 'owner'])
 * @param {string} redirectTo - Path to redirect to if unauthorized (default: '/login')
 */
const ProtectedRoute = ({ children, allowedRoles = [], redirectTo = '/login' }) => {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    console.warn('Access denied: User not authenticated');
    return <Navigate to={redirectTo} replace />;
  }

  // If specific roles are required, check if user has the required role
  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    console.warn('Access denied: User does not have required role');
    // Redirect to unauthorized page or back to login
    return <Navigate to="/login" replace />;
  }

  // User is authenticated and has required role (if specified)
  return children;
};

export default ProtectedRoute;
