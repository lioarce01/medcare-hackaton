import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { PrivateRouteProps } from '../types/auth_types';

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { data: session, isLoading } = useSession();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
