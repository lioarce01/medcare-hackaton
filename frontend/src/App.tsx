import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Medications } from './pages/Medications';
import { AddMedication } from './pages/AddMedication';
import { EditMedication } from './pages/EditMedication';
import { Adherence } from './pages/Adherence';
import { Analytics } from './pages/Analytics';
import { Profile } from './pages/Profile';
import { NotFound } from './pages/NotFound';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PrivateRoute } from './components/PrivateRoute';
import { ToastContainer } from './components/Toast';
import { FloatingLogo } from './components/FloatingLogo';
import { useSession } from './hooks/useSession';

function App() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <FloatingLogo />
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
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
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
}

export default App;