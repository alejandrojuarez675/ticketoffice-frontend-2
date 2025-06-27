import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import BackofficeLayout from './components/BackofficeLayout';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Tickets from './pages/Tickets';
import Users from './pages/Users';
import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <BackofficeLayout>
        <Navigation />
        <Box sx={{ mt: 8, mb: 4 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/users" element={<Users />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </Box>
      </BackofficeLayout>
    </Router>
  );
}

export default App;
