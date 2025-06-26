import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { BackofficeLayout } from './components/BackofficeLayout';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <Router>
      <BackofficeLayout>
        <Navigation />
        <Box sx={{ mt: 8, mb: 4 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/events" element={
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Gestión de Eventos
                  </Typography>
                  <Typography variant="body1">
                    Aquí podrás gestionar todos los eventos disponibles.
                  </Typography>
                </CardContent>
              </Card>
            } />
            <Route path="/tickets" element={
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Gestión de Boletos
                  </Typography>
                  <Typography variant="body1">
                    Aquí podrás gestionar los boletos y las ventas.
                  </Typography>
                </CardContent>
              </Card>
            } />
            <Route path="/users" element={
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Gestión de Usuarios
                  </Typography>
                  <Typography variant="body1">
                    Aquí podrás gestionar los usuarios del sistema.
                  </Typography>
                </CardContent>
              </Card>
            } />
            <Route path="/reports" element={
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Reportes
                  </Typography>
                  <Typography variant="body1">
                    Aquí podrás generar y visualizar reportes.
                  </Typography>
                </CardContent>
              </Card>
            } />
          </Routes>
        </Box>
      </BackofficeLayout>
    </Router>
  );
}

export default App;
