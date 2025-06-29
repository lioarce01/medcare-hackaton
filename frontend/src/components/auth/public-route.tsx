// PublicRoute.tsx
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function PublicRoute({ children, redirectTo = '/dashboard' }: PublicRouteProps) {
  const { session, isLoading, isInitialized } = useAuth();

  console.log('PublicRoute state:', {
    hasSession: !!session,
    isLoading,
    isInitialized,
    redirectTo
  });

  // Mostrar loader solo durante la carga inicial
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin rounded-full h-8 w-8 text-emerald-600" />
      </div>
    );
  }

  // Si hay sesión activa, redirigir al dashboard
  if (session) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si no hay sesión, mostrar el contenido público
  return <>{children}</>;
}