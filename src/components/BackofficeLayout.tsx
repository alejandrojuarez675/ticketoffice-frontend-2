import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, AppBar, Toolbar, Typography, Button, Container, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { theme } from '../theme';

interface BackofficeLayoutProps {
  children: React.ReactNode;
}

const BackofficeLayout: React.FC<BackofficeLayoutProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                <a href="/">TicketOffice</a>
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="inherit" component={RouterLink} to="/admin/dashboard">
                Dashboard
              </Button>
              <Button color="inherit" component={RouterLink} to="/admin/events">
                Eventos
              </Button>
              <Button color="inherit" component={RouterLink} to="/admin/tickets">
                Boletos
              </Button>
              <Button color="inherit" component={RouterLink} to="/admin/users">
                Usuarios
              </Button>
              <Button color="inherit" component={RouterLink} to="/admin/reports">
                Reportes
              </Button>
              <Button color="inherit" component={RouterLink} to="/logout">
                Logout
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          {children}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default BackofficeLayout;
