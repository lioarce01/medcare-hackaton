import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider, useTheme } from '@/contexts/theme-context';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useRealtimeSubscriptions } from '@/hooks/useRealtime';
import { useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { ProgressBar } from '@/components/ui/progress-bar';
import { queryClient } from '@/lib/query-client';
import { useHealthCheck } from '@/hooks/useHealthCheck';
import { getHealthCheckConfig } from '@/config/health-check';

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
import { PublicRoute } from './components/auth/public-route';

// Component to handle real-time subscriptions only for authenticated users
function RealtimeProvider({ children }: { children: React.ReactNode }) {
  useRealtimeSubscriptions();
  return <>{children}</>;
}

// Component to handle global navigation loading
function NavigationLoader({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsNavigating(true);

    // Set a shorter timeout for better UX
    timeoutRef.current = setTimeout(() => {
      setIsNavigating(false);
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location.pathname]);

  return (
    <>
      <ProgressBar isLoading={isNavigating} />
      {children}
    </>
  );
}

function FloatingBoltIcon() {
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode = (theme === 'dark') ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setIsDark(isDarkMode);
    };

    checkTheme();

    // Listen for system theme changes if using system theme
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => checkTheme();

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

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
          loading="lazy"
        />
      </a>
    </div>
  );
}

function App() {
  // Initialize health check service with configuration
  const healthCheckConfig = getHealthCheckConfig();
  useHealthCheck({
    intervalMinutes: healthCheckConfig.INTERVAL_MINUTES,
    autoStart: healthCheckConfig.AUTO_START
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider>
          <AuthProvider>
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
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;