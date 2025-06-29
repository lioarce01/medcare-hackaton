import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContextType } from '@/types';
import { useAuth as useSupabaseAuth, useSignIn, useSignUp, useSignOut } from '@/hooks/useAuth';
import { supabase } from '@/config/supabase';
import { queryClient } from '@/App';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const {
    user: currentUser,
    session,
    isAuthenticated,
    isLoading: authLoading,
    error: authQueryError,
    isPremium,
  } = useSupabaseAuth();

  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();
  const signOutMutation = useSignOut();

  // Función para manejar la invalidación de queries
  const invalidateAuthQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["session"] });
    queryClient.invalidateQueries({ queryKey: ["user"] });
    queryClient.invalidateQueries({ queryKey: ["profile"] }); // Por si tienes datos de perfil
  }, []);

  // Función para manejar errores de autenticación
  const handleAuthError = useCallback((error: any) => {
    setAuthError(error?.message || 'Error de autenticación');

    // Limpiar error después de 5 segundos
    setTimeout(() => setAuthError(null), 5000);
  }, []);

  // Combinar errores de queries y operaciones
  useEffect(() => {
    if (authQueryError) {
      handleAuthError(authQueryError);
    }
  }, [authQueryError, handleAuthError]);

  // Effect adicional para manejar el estado inicial cuando ya tenemos sesión
  useEffect(() => {
    if (!authLoading && session !== undefined) {
      setIsInitializing(false);
    }
  }, [authLoading, session]);

  // Helper: Retry fetching user profile/settings with backoff
  async function waitForUserProfile(userId: string, maxAttempts = 6, delayMs = 500): Promise<void> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Try to fetch both profile and settings
        await Promise.all([
          import('@/api/auth').then(m => m.getUserProfile(userId)),
          import('@/api/auth').then(m => m.getUserSettings(userId)),
        ]);
        return; // Success
      } catch (err) {
        if (attempt === maxAttempts) throw err;
        await new Promise(res => setTimeout(res, delayMs * attempt)); // Exponential backoff
      }
    }
  }

  // Funciones de autenticación con manejo de errores mejorado
  const login = async (email: string, password: string, redirectTo?: string) => {
    setIsSigningIn(true);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
      } else if (redirectTo) {
        window.location.href = redirectTo;
      }
    } catch (error) {
      setAuthError('An unexpected error occurred');
    } finally {
      setIsSigningIn(false);
    }
  };

  const register = async (name: string, email: string, password: string, redirectTo?: string) => {
    setIsSigningUp(true);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) {
        setAuthError(error.message);
      } else if (redirectTo) {
        window.location.href = redirectTo;
      }
    } catch (error) {
      setAuthError('An unexpected error occurred');
    } finally {
      setIsSigningUp(false);
    }
  };

  const logout = async (redirectTo?: string) => {
    setIsSigningOut(true);

    try {
      await supabase.auth.signOut();
      if (redirectTo) {
        window.location.href = redirectTo;
      }
    } catch (error) {
      // Error handling is done in the component
    } finally {
      setIsSigningOut(false);
    }
  };

  // Función para limpiar errores manualmente
  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Función para reautenticar (útil cuando el token expira)
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        // Error handling is done in the component
      }
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const isLoading =
    authLoading ||
    isInitializing ||
    signInMutation.isPending ||
    signUpMutation.isPending ||
    signOutMutation.isPending ||
    isSigningIn ||
    isSigningUp ||
    isSigningOut;

  const contextValue: AuthContextType = {
    user: currentUser || null,
    session: session || null,
    isAuthenticated: isAuthenticated || false,
    isLoading,
    isInitializing,
    authError,
    isPremium: isPremium || false,
    login,
    register,
    logout,
    clearError,
    refreshSession,
    // Estados de las mutaciones para UI feedback
    isSigningIn: signInMutation.isPending || isSigningIn,
    isSigningUp: signUpMutation.isPending || isSigningUp,
    isSigningOut: signOutMutation.isPending || isSigningOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};