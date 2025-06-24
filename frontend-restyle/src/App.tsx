import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useRealtimeSubscriptions } from '@/hooks/useRealtime';

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
  // Este componente podría redirigir usuarios autenticados lejos de login/register
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <RealtimeProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
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