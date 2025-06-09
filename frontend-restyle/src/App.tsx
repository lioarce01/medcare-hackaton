import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { ProtectedRoute } from '@/components/auth/protected-route';

// Pages
import { LandingPage } from '@/pages/landing';
import { LoginPage } from '@/pages/auth/login';
import { RegisterPage } from '@/pages/auth/register';
import { DashboardPage } from '@/pages/dashboard';
import { MedicationsPage } from '@/pages/medications';
import { AdherencePage } from '@/pages/adherence';
import { AnalyticsPage } from '@/pages/analytics';

import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
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
              
              {/* Placeholder routes for future implementation */}
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/reminders" element={
                <ProtectedRoute>
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-2">Reminders Page</h2>
                      <p className="text-muted-foreground">Coming soon...</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-2">Profile Page</h2>
                      <p className="text-muted-foreground">Coming soon...</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              
              {/* Redirect unknown routes */}
              <Route path="*" element={<Navigate to="/\" replace />} />
            </Routes>
          </Router>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;