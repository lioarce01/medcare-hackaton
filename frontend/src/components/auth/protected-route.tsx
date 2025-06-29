import { Navigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, user, isLoading, isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute state:', {
    hasSession: !!session,
    hasUser: !!user,
    isLoading,
    isAuthenticated,
    isInitialized,
    pathname: location.pathname
  });

  // Mostrar loader durante la carga inicial
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin rounded-full h-8 w-8 text-emerald-600" />
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si está autenticado, mostrar la página protegida
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  );
}