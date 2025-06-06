import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PrivateRoute } from './components/PrivateRoute';
import { ToastProvider } from './components/Toast';
import { FloatingLogo } from './components/FloatingLogo';
import { useSession } from './hooks/useSession';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useTranslation } from 'react-i18next';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { I18nextProvider } from "react-i18next"
import i18n from "./i18n"
import { initSentry, SentryErrorBoundary } from "./lib/sentry"
import { AccessibilityProvider } from './components/AccessibilityProvider'

// Lazy load pages with named imports
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.default })));
const Register = lazy(() => import('./pages/Register').then(module => ({ default: module.Register })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Medications = lazy(() => import('./pages/Medications').then(module => ({ default: module.Medications })));
const AddMedication = lazy(() => import('./pages/AddMedication').then(module => ({ default: module.AddMedication })));
const EditMedication = lazy(() => import('./pages/EditMedication').then(module => ({ default: module.EditMedication })));
const Adherence = lazy(() => import('./pages/Adherence').then(module => ({ default: module.Adherence })));
const Analytics = lazy(() => import('./pages/Analytics').then(module => ({ default: module.Analytics })));
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const NotFound = lazy(() => import('./pages/NotFound').then(module => ({ default: module.NotFound })));
const Subscription = lazy(() => import('./pages/Subscription').then(module => ({ default: module.Subscription })));
const SubscriptionSuccess = lazy(() => import('./pages/SubscriptionSuccess').then(module => ({ default: module.SubscriptionSuccess })));

// Loading component for suspense fallback
const PageLoader = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">{t('common.loading')}</p>
      </div>
    </div>
  );
};

// Initialize Sentry
initSentry()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  const { data: session } = useSession();

  return (
    <SentryErrorBoundary fallback={<div>An error has occurred</div>}>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <AccessibilityProvider>
            <ToastProvider>
              <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                <FloatingLogo />
                <Header />
                <main id="main-content" className="flex-grow container mx-auto px-4 py-8" role="main">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route 
                        path="/login" 
                        element={session ? <Navigate to="/dashboard" replace /> : <Login />} 
                      />
                      <Route 
                        path="/register" 
                        element={session ? <Navigate to="/dashboard" replace /> : <Register />} 
                      />
                      
                      <Route path="/dashboard" element={
                        <PrivateRoute>
                          <Dashboard />
                        </PrivateRoute>
                      } />
                      
                      <Route path="/medications" element={
                        <PrivateRoute>
                          <Medications />
                        </PrivateRoute>
                      } />
                      
                      <Route path="/medications/add" element={
                        <PrivateRoute>
                          <AddMedication />
                        </PrivateRoute>
                      } />
                      
                      <Route path="/medications/edit/:id" element={
                        <PrivateRoute>
                          <EditMedication />
                        </PrivateRoute>
                      } />
                      
                      <Route path="/adherence" element={
                        <PrivateRoute>
                          <Adherence />
                        </PrivateRoute>
                      } />
                      
                      <Route path="/analytics" element={
                        <PrivateRoute>
                          <Analytics />
                        </PrivateRoute>
                      } />
                      
                      <Route path="/profile" element={
                        <PrivateRoute>
                          <Profile />
                        </PrivateRoute>
                      } />
                      
                      <Route path="/subscription" element={
                        <PrivateRoute>
                          <Subscription />
                        </PrivateRoute>
                      } />
                      
                      <Route path="/subscription/success" element={
                        <PrivateRoute>
                          <SubscriptionSuccess />
                        </PrivateRoute>
                      } />
                      
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </main>
                <Footer />
              </div>
            </ToastProvider>
          </AccessibilityProvider>
        </I18nextProvider>
      </QueryClientProvider>
    </SentryErrorBoundary>
  );
}

export default App;