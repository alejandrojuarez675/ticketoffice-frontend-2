import { Box, Card, CardContent, Typography } from '@mui/material';
import { BackofficeLayout } from './components/BackofficeLayout';

function App() {
  return (
    <BackofficeLayout>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Bienvenido al Backoffice de Ticket Office
            </Typography>
            <Typography variant="body1">
              Este será el panel de administración donde podrás gestionar:
              <ul>
                <li>Eventos</li>
                <li>Boletos</li>
                <li>Usuarios</li>
                <li>Reportes</li>
              </ul>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </BackofficeLayout>
  );
}

export default App;
