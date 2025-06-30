import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, AppBar, Toolbar, Typography, Button, Container, Link as MuiLink, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { EventService } from '../services/EventService';
import { EventForList } from '../types/Event';
import { theme } from '../theme';

interface BackofficeLayoutProps {
  children: React.ReactNode;
}

const BackofficeLayout: React.FC<BackofficeLayoutProps> = ({ children }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState<null | HTMLElement>(null);
  const [openValidateModal, setOpenValidateModal] = React.useState(false);
  const [events, setEvents] = React.useState<EventForList[]>([]);
  const [selectedEvent, setSelectedEvent] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await EventService.getEvents();
        setEvents(response.events);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleOpenValidateModal = () => {
    setOpenValidateModal(true);
  };

  const handleCloseValidateModal = () => {
    setOpenValidateModal(false);
    setSelectedEvent(null);
  };

  const handleValidateSubmit = () => {
    if (selectedEvent) {
      navigate(`/admin/events/${selectedEvent}/sales/validate`);
    }
    handleCloseValidateModal();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>TicketOffice</a>
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="inherit" component={RouterLink} to="/admin/dashboard">
                Dashboard
              </Button>
              <Button color="inherit" component={RouterLink} to="/admin/events">
                Eventos
              </Button>
              <Button color="inherit" component={RouterLink} to="/admin/reports">
                Reportes
              </Button>
              <Button color="inherit" onClick={handleOpenValidateModal}>
                Validar Entradas
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
        <Dialog open={openValidateModal} onClose={handleCloseValidateModal} maxWidth="sm" fullWidth>
          <DialogTitle>Validar Entrada</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Evento</InputLabel>
                <Select
                  value={selectedEvent || ''}
                  label="Evento"
                  onChange={(e) => setSelectedEvent(e.target.value as string)}
                  disabled={isLoading}
                >
                  {events.map((event) => (
                    <MenuItem key={event.id} value={event.id}>
                      {event.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseValidateModal} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleValidateSubmit} color="primary" variant="contained" disabled={!selectedEvent}>
              Validar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default BackofficeLayout;
