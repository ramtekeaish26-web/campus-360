import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { RoleCode } from '../../types/index.js';
import { Spinner } from '../ui/Spinner.js';

interface RoleRouteProps {
  children: React.ReactElement;
  allowedRoles: RoleCode[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading, hasAnyRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Spinner size="lg" label="Verifying role authorizations..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasAnyRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
