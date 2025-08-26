// src/app/admin/events/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
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
import type { Theme } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import { EventService, type EventListResponse } from '@/services/EventService';
import type { EventForList } from '@/types/Event';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/common/Loading';
import ErrorState from '@/components/common/ErrorState';
import Empty from '@/components/common/Empty';

function EventActionsMenu({
  anchorEl,
  open,
  onClose,
  onViewDetails,
  onViewAsClient,
  onViewSales,
  onValidate,
  onEdit,
  onDelete,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onViewDetails: () => void;
  onViewAsClient: () => void;
  onViewSales: () => void;
  onValidate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Menu id="event-actions-menu" anchorEl={anchorEl} keepMounted open={open} onClose={onClose}>
      <MenuItem onClick={onViewDetails}>
        <Typography variant="body2">Ver detalles</Typography>
      </MenuItem>
      <MenuItem onClick={onViewAsClient}>
        <Typography variant="body2">Ver como cliente</Typography>
      </MenuItem>
      <MenuItem onClick={onViewSales}>
        <Typography variant="body2">Ver ventas</Typography>
      </MenuItem>
      <MenuItem onClick={onValidate}>
        <Typography variant="body2">Validar entradas</Typography>
      </MenuItem>
      <MenuItem onClick={onEdit}>
        <Typography variant="body2">Editar</Typography>
      </MenuItem>
      <MenuItem onClick={onDelete}>
        <Typography variant="body2" color="error">
          Eliminar
        </Typography>
      </MenuItem>
    </Menu>
  );
}

const EventsList = () => {
  const router = useRouter();
  const theme = useTheme();
  const { isAuthenticated, hasBackofficeAccess, isLoading } = useAuth();

  const [events, setEvents] = useState<EventForList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 1 });

  // Guards
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/auth/login?next=' + encodeURIComponent('/admin/events'));
      return;
    }
    if (!hasBackofficeAccess) {
      router.replace('/');
      return;
    }
  }, [isAuthenticated, hasBackofficeAccess, isLoading, router]);

  // Fetch events
  useEffect(() => {
    if (!isAuthenticated || !hasBackofficeAccess) return;
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data: EventListResponse = await EventService.getEvents(pagination.page, pagination.pageSize);
        setEvents(data.events);
        setPagination((prev) => ({ ...prev, total: data.total, totalPages: data.totalPages }));
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Error al cargar los eventos. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [pagination.page, pagination.pageSize, isAuthenticated, hasBackofficeAccess]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, eventId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedEventId(eventId);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEventId(null);
  };

  const handleCreateEvent = () => router.push('/admin/events/new');

  const handleViewDetails = () => {
    if (selectedEventId) router.push(`/admin/events/${selectedEventId}`);
    handleMenuClose();
  };
  const handleViewAsClient = () => {
    if (selectedEventId) router.push(`/events/${selectedEventId}`);
    handleMenuClose();
  };
  const handleViewSales = () => {
    if (selectedEventId) router.push(`/admin/events/${selectedEventId}/sales`);
    handleMenuClose();
  };
  const handleValidateTickets = () => {
    if (selectedEventId) router.push(`/admin/events/${selectedEventId}/validate`);
    handleMenuClose();
  };
  const handleEditEvent = () => {
    if (selectedEventId) router.push(`/admin/events/${selectedEventId}/edit`);
    handleMenuClose();
  };
  const handleDeleteEvent = async () => {
    if (!selectedEventId) return;
    try {
      setLoading(true);
      await EventService.deleteEvent(selectedEventId);
      const data = await EventService.getEvents(pagination.page, pagination.pageSize);
      setEvents(data.events);
      setPagination((prev) => ({ ...prev, total: data.total, totalPages: data.totalPages }));
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Error al eliminar el evento. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  const handlePageChange = (newPage: number) => setPagination((prev) => ({ ...prev, page: newPage }));

  if (isLoading || (loading && events.length === 0)) {
    return <Loading label="Cargando eventos..." minHeight="60vh" />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestión de Eventos
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleCreateEvent} disabled={loading}>
          Nuevo Evento
        </Button>
      </Box>

      {error && (
        <Box mb={3}>
          <ErrorState message={error} onRetry={() => window.location.reload()} />
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
                    <TableCell>{new Date(event.date).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' })}</TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>
                      <Box component="span" sx={{ color: getStatusColor(event.status, theme), fontWeight: 'medium' }}>
                        {event.status === 'ACTIVE' && 'Activo'}
                        {event.status === 'INACTIVE' && 'Inactivo'}
                        {event.status === 'SOLD_OUT' && 'Agotado'}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton aria-label="acciones" onClick={(e) => handleMenuOpen(e, event.id)} disabled={loading}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

                {events.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Empty title="Sin eventos" description="No hay eventos disponibles" />
                    </TableCell>
                  </TableRow>
                )}

                {loading && events.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Loading label="" minHeight={0} size={24} />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

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

      <EventActionsMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onViewDetails={handleViewDetails}
        onViewAsClient={handleViewAsClient}
        onViewSales={handleViewSales}
        onValidate={handleValidateTickets}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />
    </Box>
  );
};

function getStatusColor(status: 'ACTIVE' | 'INACTIVE' | 'SOLD_OUT', theme: Theme) {
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
}

export default function EventsPage() {
  return (
    <BackofficeLayout title="Eventos">
      <EventsList />
    </BackofficeLayout>
  );
}

