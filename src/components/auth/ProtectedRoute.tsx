import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../providers/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to unauthorized page
    return <Navigate replace to="/unauthorized" />;
  }

  return <>{children}</>;
};

export default React.memo(ProtectedRoute);
