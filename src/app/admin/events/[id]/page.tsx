// src/app/admin/events/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import { EventService } from '@/services/EventService';
import type { EventDetail } from '@/types/Event';
import { useAuth } from '@/hooks/useAuth';

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Loading from '@/components/common/Loading';
import ErrorState from '@/components/common/ErrorState';
import Empty from '@/components/common/Empty';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, hasBackofficeAccess, isLoading } = useAuth();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guards
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/auth/login?next=' + encodeURIComponent(`/admin/events/${id}`));
      return;
    }
    if (!hasBackofficeAccess) {
      router.replace('/');
      return;
    }
  }, [id, isAuthenticated, hasBackofficeAccess, isLoading, router]);

  // Fetch
  useEffect(() => {
    if (!id || !isAuthenticated || !hasBackofficeAccess) return;
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const eventData = await EventService.getEventById(id);
        setEvent(eventData);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Error al cargar los detalles del evento');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, isAuthenticated, hasBackofficeAccess]);

  const handleBack = () => router.push('/admin/events');
  const handleEdit = () => event && router.push(`/admin/events/${event.id}/edit`);

  if (isLoading || loading) {
    return (
      <BackofficeLayout title="Cargando...">
        <Loading minHeight="60vh" />
      </BackofficeLayout>
    );
  }

  if (error) {
    return (
      <BackofficeLayout title="Error">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </BackofficeLayout>
    );
  }

  if (!event) {
    return (
      <BackofficeLayout title="Evento no encontrado">
        <Empty title="Evento no encontrado" description="No pudimos encontrar el evento solicitado." />
      </BackofficeLayout>
    );
  }

  const formattedDate = format(new Date(event.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  const formattedTime = format(new Date(event.date), "HH:mm 'hs'", { locale: es });

  return (
    <BackofficeLayout title={event.title || 'Detalles del Evento'}>
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 200 }}>
            <IconButton onClick={handleBack} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1" noWrap>
              {event.title || 'Detalles del Evento'}
            </Typography>
          </Box>
          <Button variant="contained" onClick={handleEdit} startIcon={<EditIcon />} size={isMobile ? 'medium' : 'large'}>
            Editar Evento
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Box
                  component="img"
                  src={event.image?.url || '/images/event-placeholder.jpg'}
                  alt={event.title}
                  sx={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: 1, mb: 2 }}
                />

                <Typography variant="h6" gutterBottom>
                  Descripción
                </Typography>
                <Typography component="p" sx={{ mb: 2 }}>
                  {event.description || 'No hay descripción disponible para este evento.'}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Información del evento
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <CalendarIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Fecha y hora" secondary={`${formattedDate} a las ${formattedTime}`} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <LocationIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Ubicación"
                          secondary={event.location ? `${event.location.name}, ${event.location.city}` : 'Ubicación no especificada'}
                        />
                      </ListItem>
                    </List>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <List dense>
                      {event.tickets?.map((ticket) => (
                        <ListItem key={ticket.id}>
                          <ListItemIcon>
                            {ticket.stock > 0 ? <EventAvailableIcon color="success" /> : <EventBusyIcon color="error" />}
                          </ListItemIcon>
                          <ListItemText
                            primary={ticket.type || 'Entrada general'}
                            secondary={
                              <>
                                <Box component="span" display="block">
                                  {ticket.isFree ? 'Gratis' : `$${ticket.value.toFixed(2)} ${ticket.currency}`}
                                </Box>
                                <Box component="span" display="block">
                                  {ticket.stock > 0 ? `${ticket.stock} entradas disponibles` : 'Agotado'}
                                </Box>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>

                {event.additionalInfo?.length ? (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Información adicional
                    </Typography>
                    <List dense>
                      {event.additionalInfo.map((info, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={info} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                ) : null}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Estado del evento
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip label={event.status === 'ACTIVE' ? 'Activo' : 'Inactivo'} color={event.status === 'ACTIVE' ? 'success' : 'default'} size="small" />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Organizador
                </Typography>
                {event.organizer ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {event.organizer.logoUrl && (
                      <Box component="img" src={event.organizer.logoUrl} alt={event.organizer.name} sx={{ width: 40, height: 40, borderRadius: '50%', mr: 1.5 }} />
                    )}
                    <Box>
                      <Typography variant="subtitle1">{event.organizer.name}</Typography>
                      {event.organizer.url && (
                        <Typography variant="body2" color="text.secondary">
                          <a href={event.organizer.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                            {new URL(event.organizer.url).hostname}
                          </a>
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No especificado
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </BackofficeLayout>
  );
}