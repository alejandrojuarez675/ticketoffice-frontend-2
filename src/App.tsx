import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BackofficeLayout from './components/BackofficeLayout';
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import TicketsPage from './pages/TicketsPage';
import UsersPage from './pages/UsersPage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import { authService } from 'services/auth';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = authService.getCurrentUser();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/logout" element={<Navigate to="/login" replace />} />

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
        <Route path="/admin/tickets" element={
          <PrivateRoute>
            <BackofficeLayout>
              <TicketsPage />
            </BackofficeLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/users" element={
          <PrivateRoute>
            <BackofficeLayout>
              <UsersPage />
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
