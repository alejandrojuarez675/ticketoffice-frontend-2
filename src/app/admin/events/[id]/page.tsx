// src/app/admin/events/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import { EventService } from '@/services/EventService';
import type { EventDetail } from '@/types/Event';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress,
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
import ErrorState from '@/components/common/ErrorState';
import Empty from '@/components/common/Empty';
import Link from 'next/link';
import { formatMoneyByCountry } from '@/utils/format';
import { isValidId } from '@/utils/validation';

export default function AdminEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  // Validar ID al inicio - redirigir si es inválido
  useEffect(() => {
    if (id && !isValidId(id)) {
      router.replace('/');
    }
  }, [id, router]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated, isLoading } = useAuth();
  const hasBackoffice = !!user && (user.role === 'admin' || user.role === 'seller');

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/auth/login?next=' + encodeURIComponent(`/admin/events/${id}`));
      return;
    }
    if (!hasBackoffice) {
      router.replace('/');
      return;
    }
  }, [id, isAuthenticated, hasBackoffice, isLoading, router]);

  useEffect(() => {
    if (!id || !isAuthenticated || !hasBackoffice) return;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await EventService.getEventById(id);
        setEvent(data);
      } catch (err) {
         
        console.error(err);
        setError('Error al cargar el evento');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isAuthenticated, hasBackoffice]);

  const handleBack = () => router.push('/admin/events');

  if (isLoading || loading) {
    return (
      <BackofficeLayout title="Cargando...">
        <Box display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
          <CircularProgress />
        </Box>
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

  return (
    <BackofficeLayout title={event.title || 'Detalles del Evento'}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Button onClick={handleBack} startIcon={<ArrowBackIcon />} variant="text">
            Volver
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button component={Link} href={`/admin/events/${event.id}/edit`} variant="contained" startIcon={<EditIcon />}>
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
                  {event.description || 'Sin descripción.'}
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
                        <ListItemText primary="Fecha y hora" secondary={new Date(event.date).toLocaleString('es-AR')} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <LocationIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Ubicación"
                          secondary={
                            event.location
                              ? `${event.location.name}, ${event.location.city}, ${event.location.country}`
                              : 'Ubicación no especificada'
                          }
                        />
                      </ListItem>
                    </List>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <List dense>
                      {event.tickets?.map((t) => (
                        <ListItem key={t.id}>
                          <ListItemIcon>{t.stock > 0 ? <EventAvailableIcon color="success" /> : <EventBusyIcon color="error" />}</ListItemIcon>
                          <ListItemText
                            primary={t.type || 'Entrada'}
                            secondary={
                              <>
                                <Box component="span" display="block">
                                  {t.isFree ? 'Gratis' : formatMoneyByCountry(t.value, event.location?.country)}
                                </Box>
                                <Box component="span" display="block">
                                  {t.stock > 0 ? `${t.stock} disponibles` : 'Agotado'}
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
                      {event.additionalInfo.map((info, i) => (
                        <ListItem key={i}>
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
                <Chip
                  label={event.status === 'ACTIVE' ? 'Activo' : event.status ?? '—'}
                  color={event.status === 'ACTIVE' ? 'success' : 'default'}
                  size="small"
                />
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Organizador
                </Typography>
                {event.organizer ? (
                  <Box>
                    <Typography variant="subtitle1">{event.organizer.name}</Typography>
                    {event.organizer.url && <Typography variant="body2" color="text.secondary">{event.organizer.url}</Typography>}
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
