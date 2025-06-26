import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

export const Navigation: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Backoffice
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" component={RouterLink} to="/dashboard">
            Dashboard
          </Button>
          <Button color="inherit" component={RouterLink} to="/events">
            Eventos
          </Button>
          <Button color="inherit" component={RouterLink} to="/tickets">
            Boletos
          </Button>
          <Button color="inherit" component={RouterLink} to="/users">
            Usuarios
          </Button>
          <Button color="inherit" component={RouterLink} to="/reports">
            Reportes
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
