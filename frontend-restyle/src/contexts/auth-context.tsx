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
    console.error('Auth error:', error);
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
  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return;

      console.log("Auth state changed:", event, session?.user?.id || 'no user');
      
      try {
        switch (event) {
          case 'INITIAL_SESSION':
            setIsInitializing(false);
            if (session) {
              invalidateAuthQueries();
            }
            break;
            
          case 'SIGNED_IN':
            setAuthError(null);
            invalidateAuthQueries();
            console.log('User signed in:', session?.user?.email);
            break;
            
          case 'SIGNED_OUT':
            setAuthError(null);
            // Limpiar todas las queries relacionadas con el usuario
            queryClient.clear();
            console.log('User signed out');
            break;
            
          case 'TOKEN_REFRESHED':
            invalidateAuthQueries();
            console.log('Token refreshed for user:', session?.user?.email);
            break;
            
          case 'USER_UPDATED':
            invalidateAuthQueries();
            console.log('User updated:', session?.user?.email);
            break;
            
          default:
            console.log('Unhandled auth event:', event);
        }
      } catch (error) {
        handleAuthError(error);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [invalidateAuthQueries, handleAuthError]);

  // Funciones de autenticación con manejo de errores mejorado
  const login = async (email: string, password: string, redirectTo: string = '/dashboard') => {
    try {
      setAuthError(null);
      const result = await signInMutation.mutateAsync({ email, password });
      
      // Redirección después de login exitoso
      navigate(redirectTo);
      
      return result;
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, redirectTo: string = '/login') => {
    try {
      setAuthError(null);
      const result = await signUpMutation.mutateAsync({ name, email, password });
      
      // Redirección después de registro exitoso
      navigate(redirectTo);
      
      return result;
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  };

  const logout = async (redirectTo: string = '/login') => {
    try {
      setAuthError(null);
      await signOutMutation.mutateAsync();
      
      // Redirección después de logout exitoso
      navigate(redirectTo);
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  };

  // Función para limpiar errores manualmente
  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Función para reautenticar (útil cuando el token expira)
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return data;
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  }, [handleAuthError]);

  const isLoading =
    authLoading ||
    isInitializing ||
    signInMutation.isPending ||
    signUpMutation.isPending ||
    signOutMutation.isPending;

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
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isSigningOut: signOutMutation.isPending,
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