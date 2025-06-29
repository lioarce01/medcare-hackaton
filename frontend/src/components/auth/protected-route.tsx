import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Header } from '@/components/layout/header';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isInitializing } = useAuth();
  const location = useLocation();

  if (isLoading || isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin rounded-full h-8 w-8 text-emerald-600" />
        <span className="ml-2">Verifying authentication...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  );
}