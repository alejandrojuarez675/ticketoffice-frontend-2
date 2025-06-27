import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BackofficeLayout from './components/BackofficeLayout';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Tickets from './pages/Tickets';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Landing from './pages/Landing';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = localStorage.getItem('token');
  console.log("isAuthenticated", isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Navigate to="/login" replace />} />
        <Route
          path="/admin"
          element={
              <BackofficeLayout>
                  <PrivateRoute>
                  <Routes>
                    {/* <Route path="/" element={<Navigate to="dashboard" replace />} /> */}
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="events" element={<Events />} />
                    <Route path="tickets" element={<Tickets />} />
                    <Route path="users" element={<Users />} />
                    <Route path="reports" element={<Reports />} />
                    {/* <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />   */}
                </Routes>
                </PrivateRoute>
              </BackofficeLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
