import React, { createContext } from 'react';
import { AuthContextType } from '@/types';
import { useSession } from '@/hooks/useAuth';

// Crear el contexto con un valor por defecto
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Componente Provider simplificado
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isPending } = useSession();

  const value: AuthContextType = {
    session: data?.session ?? null,
    user: data?.user ?? null,
    isLoading: isPending,
    isAuthenticated: !!data?.session && !!data?.user,
    isInitialized: !isPending // Simplificado
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}