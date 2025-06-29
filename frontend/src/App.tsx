import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider, useTheme } from '@/contexts/theme-context';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useRealtimeSubscriptions } from '@/hooks/useRealtime';
import { useAuth } from '@/contexts/auth-context';
import { Navigate } from 'react-router-dom';

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

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Component to handle real-time subscriptions
function RealtimeProvider({ children }: { children: React.ReactNode }) {
  useRealtimeSubscriptions();
  return <>{children}</>;
}

// Component to handle auth redirects for public routes
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isInitializing } = useAuth();

  // Show loading while checking authentication
  if (isLoading || isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;