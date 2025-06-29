import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider, useTheme } from '@/contexts/theme-context';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useRealtimeSubscriptions } from '@/hooks/useRealtime';
import { useAuth } from '@/contexts/auth-context';
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/config/supabase';
import { ProgressBar } from '@/components/ui/progress-bar';
import { queryClient } from '@/lib/query-client';

// Pages
import { LandingPage } from '@/pages/landing';
import { LoginPage } from '@/pages/auth/login';
import { RegisterPage } from '@/pages/auth/register';
import { DashboardPage } from '@/pages/dashboard';
import { MedicationsPage } from '@/pages/medications';
import { AdherencePage } from '@/pages/adherence';
import { AnalyticsPage } from '@/pages/analytics';
import { RemindersPage } from '@/pages/reminders';
import { ProfilePage } from '@/pages/profile';

import './App.css';
import Subscription from './pages/subscription';
import SubscriptionSuccess from './pages/subscription-success';
import { NotFound } from './pages/NotFound';
import { Loader2 } from 'lucide-react';

// Component to handle real-time subscriptions
function RealtimeProvider({ children }: { children: React.ReactNode }) {
  useRealtimeSubscriptions();
  return <>{children}</>;
}

// Component to handle auth state changes and cache invalidation
function AuthStateListener({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('App: Auth state changed:', event, session?.user?.id);

        // Invalidate auth-related queries immediately
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["session"] }),
          queryClient.invalidateQueries({ queryKey: ["user"] }),
          queryClient.invalidateQueries({ queryKey: ["profile"] }),
        ]);

        // Clear all cache on sign out
        if (event === 'SIGNED_OUT') {
          queryClient.clear();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}

// Component to handle global navigation loading
function NavigationLoader({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate navigation triggers in Strict Mode
    if (navigationRef.current) return;

    navigationRef.current = true;
    setIsNavigating(true);

    const timer = setTimeout(() => {
      setIsNavigating(false);
      navigationRef.current = false;
    }, 500);

    return () => {
      clearTimeout(timer);
      navigationRef.current = false;
    };
  }, [location.pathname]);

  return (
    <>
      <ProgressBar isLoading={isNavigating} />
      {children}
    </>
  );
}

// Component to handle auth redirects for public routes
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isInitializing } = useAuth();

  // Show loading while checking authentication
  if (isLoading || isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin rounded-full h-8 w-8 text-emerald-600" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, show the public page
  return <>{children}</>;
}

function FloatingBoltIcon() {
  const { theme } = useTheme();
  const isDark = (theme === 'dark') || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const iconSrc = isDark ? '/white_circle_360x360.webp' : '/black_circle_360x360.webp';

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <a
        href="https://bolt.new"
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <img
          src={iconSrc}
          alt="Bolt.new"
          className="w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200"
        />
      </a>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <AuthStateListener>
              <NavigationLoader>
                <RealtimeProvider>
                  <FloatingBoltIcon />
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={
                      <PublicRoute>
                        <LandingPage />
                      </PublicRoute>
                    } />
                    <Route path="/login" element={
                      <PublicRoute>
                        <LoginPage />
                      </PublicRoute>
                    } />
                    <Route path="/register" element={
                      <PublicRoute>
                        <RegisterPage />
                      </PublicRoute>
                    } />

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    } />

                    <Route path="/medications" element={
                      <ProtectedRoute>
                        <MedicationsPage />
                      </ProtectedRoute>
                    } />

                    <Route path="/adherence" element={
                      <ProtectedRoute>
                        <AdherencePage />
                      </ProtectedRoute>
                    } />

                    <Route path="/analytics" element={
                      <ProtectedRoute>
                        <AnalyticsPage />
                      </ProtectedRoute>
                    } />

                    <Route path="/reminders" element={
                      <ProtectedRoute>
                        <RemindersPage />
                      </ProtectedRoute>
                    } />

                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } />

                    <Route path="/subscription" element={
                      <ProtectedRoute>
                        <Subscription />
                      </ProtectedRoute>
                    } />

                    <Route path="/subscription/success" element={
                      <ProtectedRoute>
                        <SubscriptionSuccess />
                      </ProtectedRoute>
                    } />

                    {/* Redirect unknown routes */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Toaster />
                </RealtimeProvider>
              </NavigationLoader>
            </AuthStateListener>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;