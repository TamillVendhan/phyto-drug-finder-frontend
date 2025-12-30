import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './Loader';

const ProtectedRoute = ({ children, adminOnly = false, roles = [] }) => {
  const { isAuthenticated, user, loading, isAdmin } = useAuth();
  const location = useLocation();

  // Show loader while checking auth
  if (loading) {
    return <PageLoader />;
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin only route
  if (adminOnly && !isAdmin()) {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <h1>403</h1>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <a href="/" className="btn btn-primary">Go Home</a>
        </div>
      </div>
    );
  }

  // Role-based access
  if (roles.length > 0 && !roles.includes(user?.role)) {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <h1>403</h1>
          <h2>Access Denied</h2>
          <p>You don't have the required role to access this page.</p>
          <a href="/" className="btn btn-primary">Go Home</a>
        </div>
      </div>
    );
  }

  // All checks passed - render children
  return children;
};

export default ProtectedRoute;