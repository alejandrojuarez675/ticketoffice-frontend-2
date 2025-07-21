import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BackofficeLayout from './components/BackofficeLayout';
import DashboardPage from './pages/admin/DashboardPage';
import EventsPage from './pages/admin/EventsPage';
import AdminEventDetailPage from './pages/admin/AdminEventDetailPage';
import AdminEventSalesPage from './pages/admin/AdminEventSalesPage';
import AdminEventTicketValidationPage from './pages/admin/AdminEventTicketValidationPage';
import AdminTicketValidationPage from './pages/admin/AdminTicketValidationPage';
import ReportsPage from './pages/admin/ReportsPage';
import LoginPage from './pages/admin/LoginPage';
import RegisterPage from './pages/admin/RegisterPage';
import LandingPage from './pages/public/LandingPage';
import { authService } from 'services/AuthService';
import LightLayout from './components/LightLayout';
import { ConfigService } from './services/ConfigService';
import CreateOrUpdateEventsPage from 'pages/admin/CreateOrUpdateEventsPage';
import EventDetailPage from 'pages/public/EventDetailPage';
import CheckoutPage from 'pages/public/CheckoutPage';
import CongratsPage from 'pages/public/CongratsPage';

function PrivateRoute({ children }: { children: React.ReactNode }): JSX.Element {
  const isAuthenticated = authService.getCurrentUser();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
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
        <Route path="/purchase/:sessionId" element={
          <LightLayout>
            <CheckoutPage />
          </LightLayout>
        } />
        <Route path="/congrats/:sessionId" element={
          <LightLayout>
            <CongratsPage />
          </LightLayout>
        } />

        {/* Protected admin routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/events/:id/sales" element={
          <PrivateRoute>
            <BackofficeLayout>
              <AdminEventSalesPage />
            </BackofficeLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/events/:id/sales/validate" element={
          <PrivateRoute>
            <BackofficeLayout>
              <AdminEventTicketValidationPage />
            </BackofficeLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/events/:id/sales/:saleId/validate" element={
          <PrivateRoute>
            <BackofficeLayout>
              <AdminTicketValidationPage />
            </BackofficeLayout>
          </PrivateRoute>
        } />
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
              <AdminEventDetailPage />
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
