import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  getAuthToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const clearAuthState = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const getAuthToken = useCallback(async (): Promise<string | null> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session for token:', error);
        return null;
      }
      return session?.access_token || null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }, []);

  const setAuthState = useCallback(async (authUser: User) => {
    try {
      // Try to get user profile, but don't fail if it doesn't exist
      const { data: profile } = await supabase
        .from('users')
        .select('name')
        .eq('id', authUser.id)
        .single();

      const userData: AuthUser = {
        id: authUser.id,
        email: authUser.email!,
        name: profile?.name || authUser.user_metadata?.name || authUser.user_metadata?.full_name
      };

      setUser(userData);
      setIsAuthenticated(true);
      console.log('User authenticated:', userData.email);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Still set basic auth data
      const userData: AuthUser = {
        id: authUser.id,
        email: authUser.email!,
        name: authUser.user_metadata?.name || authUser.user_metadata?.full_name
      };
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let refreshTimeout: NodeJS.Timeout;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          if (mounted) clearAuthState();
          return;
        }

        if (session?.user && mounted) {
          await setAuthState(session.user);
        } else if (mounted) {
          clearAuthState();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) clearAuthState();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        
        if (!mounted) return;

        // Clear any pending refresh timeout
        if (refreshTimeout) {
          clearTimeout(refreshTimeout);
        }

        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              await setAuthState(session.user);
            }
            break;
          case 'SIGNED_OUT':
            clearAuthState();
            break;
          case 'TOKEN_REFRESHED':
            if (session?.user) {
              await setAuthState(session.user);
            }
            break;
          case 'USER_UPDATED':
            if (session?.user) {
              await setAuthState(session.user);
            }
            break;
        }
      }
    );

    initAuth();

    return () => {
      mounted = false;
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      subscription.unsubscribe();
    };
  }, [setAuthState, clearAuthState]);

  const register = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          full_name: name
        }
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error('Registration failed');

    // Wait for auth state to update, then navigate
    const checkAuthAndNavigate = () => {
      if (isAuthenticated) {
        navigate('/dashboard', { replace: true });
      } else {
        // Retry after a short delay
        setTimeout(checkAuthAndNavigate, 100);
      }
    };
    
    setTimeout(checkAuthAndNavigate, 100);
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    if (!data.session) throw new Error('Login failed');

    // Get the intended destination
    const from = location.state?.from?.pathname || '/dashboard';
    
    // Wait for auth state to update, then navigate
    const checkAuthAndNavigate = () => {
      if (isAuthenticated) {
        navigate(from, { replace: true });
      } else {
        // Retry after a short delay
        setTimeout(checkAuthAndNavigate, 100);
      }
    };
    
    setTimeout(checkAuthAndNavigate, 100);
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Logout error:', error);
    
    // Clear state immediately and navigate
    clearAuthState();
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      register, 
      login, 
      logout,
      isAuthenticated,
      getAuthToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};