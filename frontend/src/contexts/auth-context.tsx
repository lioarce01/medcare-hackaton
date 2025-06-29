import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContextType } from '@/types';
import { useAuth as useSupabaseAuth, useSignIn, useSignUp, useSignOut } from '@/hooks/useAuth';
import { supabase } from '@/config/supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { queryClient } from '@/lib/query-client';

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

  // Function to handle query invalidation
  const invalidateAuthQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["session"] });
    queryClient.invalidateQueries({ queryKey: ["user"] });
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  }, []);

  // Function to handle auth errors
  const handleAuthError = useCallback((error: any) => {
    setAuthError(error?.message || 'Authentication error');
    setTimeout(() => setAuthError(null), 5000);
  }, []);

  // Handle query errors
  useEffect(() => {
    if (authQueryError) {
      handleAuthError(authQueryError);
    }
  }, [authQueryError, handleAuthError]);

  // Handle initial loading state
  useEffect(() => {
    if (!authLoading && session !== undefined) {
      setIsInitializing(false);
    }
  }, [authLoading, session]);

  // Listen to auth state changes from Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.id);

        // Invalidate queries when auth state changes
        invalidateAuthQueries();

        // Handle specific auth events
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in:', session.user.email);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          // Clear all cached data on sign out
          queryClient.clear();
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('Token refreshed for:', session.user.email);
          invalidateAuthQueries();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [invalidateAuthQueries]);

  // Auth functions using React Query mutations
  const login = async (email: string, password: string, redirectTo?: string) => {
    setAuthError(null);

    try {
      await signInMutation.mutateAsync({ email, password });

      if (redirectTo) {
        navigate(redirectTo);
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      handleAuthError(error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, redirectTo?: string) => {
    setAuthError(null);

    try {
      await signUpMutation.mutateAsync({ name, email, password });

      if (redirectTo) {
        navigate(redirectTo);
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      handleAuthError(error);
      throw error;
    }
  };

  const logout = async (redirectTo?: string) => {
    try {
      await signOutMutation.mutateAsync();

      if (redirectTo) {
        navigate(redirectTo);
      } else {
        navigate('/login');
      }
    } catch (error: any) {
      handleAuthError(error);
      throw error;
    }
  };

  // Function to clear errors manually
  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Function to refresh session
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        handleAuthError(error);
        return { data: null, error };
      }

      // Invalidate queries after successful refresh
      invalidateAuthQueries();
      return { data, error: null };
    } catch (error: any) {
      handleAuthError(error);
      return { data: null, error };
    }
  };

  const isLoading =
    authLoading ||
    isInitializing ||
    signInMutation.isPending ||
    signUpMutation.isPending ||
    signOutMutation.isPending;

  const contextValue: AuthContextType = {
    user: currentUser || null,
    session: session as any, // Type assertion to match AuthContextType
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
    // Mutation states for UI feedback
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