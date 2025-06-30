import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BackofficeLayout from './components/BackofficeLayout';
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import { authService } from 'services/AuthService';
import LightLayout from './components/LightLayout';
import { ConfigService } from './services/ConfigService';
import CreateOrUpdateEventsPage from 'pages/CreateOrUpdateEventsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = authService.getCurrentUser();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  ConfigService.setMocked(true);
  
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={
          <LightLayout>
            <LandingPage />
          </LightLayout>
        } />
        <Route path="/login" element={
          <LightLayout>
            <LoginPage />
          </LightLayout>
        } />
        <Route path="/register" element={
          <LightLayout>
            <RegisterPage />
          </LightLayout>
        } />
        <Route path="/logout" element={<Navigate to="/login" replace />} />
        <Route path="/events/:id" element={
          <LightLayout>
            <EventDetailPage />
          </LightLayout>
        } />

        {/* Protected admin routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={
          <PrivateRoute>
            <BackofficeLayout>
              <DashboardPage />
            </BackofficeLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/events" element={
          <PrivateRoute>
            <BackofficeLayout>
              <EventsPage />
            </BackofficeLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/events/:id" element={
          <PrivateRoute>
            <BackofficeLayout>
              <EventDetailPage />
            </BackofficeLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/events/new" element={
          <PrivateRoute>
            <BackofficeLayout>
              <CreateOrUpdateEventsPage />
            </BackofficeLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/events/:id" element={
          <PrivateRoute>
            <BackofficeLayout>
              <EventDetailPage />
            </BackofficeLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/events/:id/edit" element={
          <PrivateRoute>
            <BackofficeLayout>
              <CreateOrUpdateEventsPage />
            </BackofficeLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/reports" element={
          <PrivateRoute>
            <BackofficeLayout>
              <ReportsPage />
            </BackofficeLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
