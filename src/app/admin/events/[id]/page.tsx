'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Box, Button, Card, CardContent, Chip, CircularProgress, 
  Divider, Grid, IconButton, List, ListItem, ListItemIcon, 
  ListItemText, Typography, useMediaQuery, useTheme, Paper
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, CalendarToday as CalendarIcon, 
  Edit as EditIcon, EventAvailable as EventAvailableIcon, 
  EventBusy as EventBusyIcon, LocationOn as LocationIcon,
  ArrowForward as ArrowForwardIcon, AttachMoney as PriceIcon 
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import { EventService } from '@/services/EventService';
import { EventDetail } from '@/types/Event';
import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/services/AuthService';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, isAdmin } = useAuth();
  
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
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
  }, [id, isAuthenticated, isAdmin, router]);

  const handleBack = () => router.push('/admin/events');
  const handleEdit = () => event && router.push(`/admin/events/${event.id}/edit`);

  if (loading) {
    return (
      <BackofficeLayout title="Cargando...">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </BackofficeLayout>
    );
  }

  if (error) {
    return (
      <BackofficeLayout title="Error">
        <Box sx={{ p: 3 }}>
          <Typography color="error" variant="h6">{error}</Typography>
          <Button onClick={handleBack} sx={{ mt: 2 }} startIcon={<ArrowBackIcon />}>
            Volver a la lista
          </Button>
        </Box>
      </BackofficeLayout>
    );
  }

  if (!event) {
    return (
      <BackofficeLayout title="Evento no encontrado">
        <Box textAlign="center" p={4}>
          <Typography variant="h6">Evento no encontrado</Typography>
          <Button onClick={handleBack} sx={{ mt: 2 }} startIcon={<ArrowBackIcon />}>
            Volver a la lista
          </Button>
        </Box>
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
          <Button 
            variant="contained" 
            onClick={handleEdit} 
            startIcon={<EditIcon />}
            size={isMobile ? 'medium' : 'large'}
          >
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
                  sx={{
                    width: '100%',
                    height: 300,
                    objectFit: 'cover',
                    borderRadius: 1,
                    mb: 2
                  }}
                />
                
                <Typography variant="h6" gutterBottom>Descripción</Typography>
                <Typography paragraph>{event.description || 'No hay descripción disponible para este evento.'}</Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>Información del evento</Typography>
                
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><CalendarIcon color="primary" /></ListItemIcon>
                        <ListItemText primary="Fecha y hora" secondary={`${formattedDate} a las ${formattedTime}`} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><LocationIcon color="primary" /></ListItemIcon>
                        <ListItemText
                          primary="Ubicación"
                          secondary={event.location ? `${event.location.name}, ${event.location.city}` : 'Ubicación no especificada'}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <List dense>
                      {event.tickets?.map((ticket, index) => (
                        <ListItem key={index}>
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
                
                {event.additionalInfo && event.additionalInfo.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>Información adicional</Typography>
                    <List dense>
                      {event.additionalInfo.map((info, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={info} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Estado del evento</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip 
                    label={event.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                    color={event.status === 'ACTIVE' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>Organizador</Typography>
                {event.organizer ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {event.organizer.logoUrl && (
                      <Box 
                        component="img"
                        src={event.organizer.logoUrl}
                        alt={event.organizer.name}
                        sx={{ width: 40, height: 40, borderRadius: '50%', mr: 1.5 }}
                      />
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
