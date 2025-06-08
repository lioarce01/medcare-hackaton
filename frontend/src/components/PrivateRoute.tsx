import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { PrivateRouteProps } from '../types/auth_types';
import { LoadingSpinner } from './LoadingSpinner';

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { data: session, isLoading } = useSession();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
