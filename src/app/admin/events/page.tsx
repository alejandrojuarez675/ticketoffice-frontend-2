'use client';

import React, { useState, useEffect } from 'react';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import { EventService, EventListResponse } from '@/services/EventService';
import { EventForList } from '@/types/Event';
import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/services/AuthService';

const EventsList = () => {
  const router = useRouter();
  const theme = useTheme();
  const { isAuthenticated, isAdmin } = useAuth();
  const [events, setEvents] = useState<EventForList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    
    if (!AuthService.isAdmin()) {
      router.push('/');
      return;
    }
  }, [router]);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await EventService.getEvents(pagination.page, pagination.pageSize);
        setEvents(data.events);
        setPagination(prev => ({
          ...prev,
          total: data.total,
          totalPages: data.totalPages,
        }));
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Error al cargar los eventos. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && isAdmin) {
      fetchEvents();
    }
  }, [pagination.page, pagination.pageSize, isAuthenticated, isAdmin]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, eventId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedEventId(eventId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEventId(null);
  };

  const handleCreateEvent = () => {
    router.push('/admin/events/new');
  };

  const handleViewDetails = () => {
    if (selectedEventId) {
      router.push(`/admin/events/${selectedEventId}`);
      handleMenuClose();
    }
  };

  const handleViewAsClient = () => {
    if (selectedEventId) {
      router.push(`/events/${selectedEventId}`);
      handleMenuClose();
    }
  };

  const handleViewSales = () => {
    if (selectedEventId) {
      router.push(`/admin/events/${selectedEventId}/sales`);
      handleMenuClose();
    }
  };

  const handleValidateTickets = () => {
    if (selectedEventId) {
      router.push(`/admin/events/${selectedEventId}/validate`);
      handleMenuClose();
    }
  };

  const handleEditEvent = () => {
    if (selectedEventId) {
      router.push(`/admin/events/${selectedEventId}/edit`);
      handleMenuClose();
    }
  };

  const handleDeleteEvent = async () => {
    if (selectedEventId) {
      try {
        setLoading(true);
        await EventService.deleteEvent(selectedEventId);
        // Refresh events after deletion
        const data = await EventService.getEvents(pagination.page, pagination.pageSize);
        setEvents(data.events);
        setPagination(prev => ({
          ...prev,
          total: data.total,
          totalPages: data.totalPages,
        }));
      } catch (err) {
        console.error('Error deleting event:', err);
        setError('Error al eliminar el evento. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
        handleMenuClose();
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (loading && events.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return theme.palette.success.main;
      case 'INACTIVE':
        return theme.palette.text.secondary;
      case 'SOLD_OUT':
        return theme.palette.warning.main;
      default:
        return theme.palette.text.primary;
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('es-AR', options);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestión de Eventos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateEvent}
          disabled={loading}
        >
          Nuevo Evento
        </Button>
      </Box>

      {error && (
        <Box mb={3}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Ubicación</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id} hover>
                    <TableCell>{event.name}</TableCell>
                    <TableCell>{formatDate(event.date)}</TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>
                      <Box
                        component="span"
                        sx={{
                          color: getStatusColor(event.status),
                          fontWeight: 'medium',
                        }}
                      >
                        {event.status === 'ACTIVE' && 'Activo'}
                        {event.status === 'INACTIVE' && 'Inactivo'}
                        {event.status === 'SOLD_OUT' && 'Agotado'}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        aria-label="more"
                        aria-controls={`event-menu-${event.id}`}
                        aria-haspopup="true"
                        onClick={(e) => handleMenuOpen(e, event.id)}
                        disabled={loading}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {events.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No hay eventos disponibles
                    </TableCell>
                  </TableRow>
                )}
                {loading && events.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pagination.page === pageNum ? 'contained' : 'outlined'}
                  onClick={() => handlePageChange(pageNum)}
                  disabled={loading || pagination.page === pageNum}
                  sx={{ minWidth: 40, mx: 0.5 }}
                >
                  {pageNum}
                </Button>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        id="event-actions-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <Typography variant="body2">Ver detalles</Typography>
        </MenuItem>
        <MenuItem onClick={handleViewAsClient}>
          <Typography variant="body2">Ver como cliente</Typography>
        </MenuItem>
        <MenuItem onClick={handleViewSales}>
          <Typography variant="body2">Ver ventas</Typography>
        </MenuItem>
        <MenuItem onClick={handleValidateTickets}>
          <Typography variant="body2">Validar entradas</Typography>
        </MenuItem>
        <MenuItem onClick={handleEditEvent}>
          <Typography variant="body2">Editar</Typography>
        </MenuItem>
        <MenuItem onClick={handleDeleteEvent}>
          <Typography variant="body2" color="error">
            Eliminar
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default function EventsPage() {
  return (
    <BackofficeLayout title="Eventos">
      <EventsList />
    </BackofficeLayout>
  );
}
