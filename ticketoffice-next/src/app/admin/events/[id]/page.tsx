'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Paper, 
  Box, 
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery,
  IconButton,
  Chip
} from '@mui/material';
import { EventService } from '@/services/EventService';
import { EventDetail } from '@/types/event';
import { 
  ArrowBack as ArrowBackIcon, 
  Edit as EditIcon, 
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
  AttachMoney as PriceIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, isAdmin } = useAuth();
  
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!isAuthenticated || !isAdmin) {
      router.push('/auth/login');
      return;
    }

    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const eventData = await EventService.getEventById(id as string);
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

  const handleBack = () => {
    router.push('/admin/events');
  };

  const handleEdit = () => {
    if (event) {
      router.push(`/admin/events/${event.id}/edit`);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button 
          variant="outlined" 
          onClick={handleBack}
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Volver a la lista de eventos
        </Button>
      </Box>
    );
  }

  if (!event) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Evento no encontrado</Typography>
        <Button 
          variant="outlined" 
          onClick={handleBack}
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Volver a la lista de eventos
        </Button>
      </Box>
    );
  }

  // Format date and time
  const formattedDate = format(new Date(event.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  const formattedTime = format(new Date(event.date), "HH:mm 'hs'", { locale: es });
  const formattedCreatedAt = format(new Date(event.createdAt), "dd/MM/yyyy HH:mm");
  const formattedUpdatedAt = event.updatedAt ? format(new Date(event.updatedAt), "dd/MM/yyyy HH:mm") : 'Nunca';

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Detalles del Evento
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          color="primary"
          onClick={handleEdit}
          startIcon={<EditIcon />}
        >
          Editar
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <Box
              component="img"
              src={event.imageUrl || '/images/event-placeholder.jpg'}
              alt={event.name}
              sx={{
                width: '100%',
                height: 300,
                objectFit: 'cover',
                borderBottom: `1px solid ${theme.palette.divider}`
              }}
            />
            <CardContent>
              <Typography variant="h4" component="h2" gutterBottom>
                {event.name}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Chip 
                  label={event.isActive ? 'Activo' : 'Inactivo'} 
                  color={event.isActive ? 'success' : 'error'} 
                  size="small"
                  sx={{ mb: 2 }}
                />
                <Typography variant="body1" paragraph>
                  {event.description}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CalendarIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Fecha" 
                        secondary={`${formattedDate} a las ${formattedTime}`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <LocationIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Ubicación" 
                        secondary={event.location || 'No especificada'} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <PriceIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Precio" 
                        secondary={event.price ? `$${event.price.toFixed(2)}` : 'Gratis'} 
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <PeopleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Capacidad" 
                        secondary={event.capacity ? `${event.capacity} personas` : 'Ilimitada'} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {event.availableTickets > 0 ? 
                          <EventAvailableIcon color="success" /> : 
                          <EventBusyIcon color="error" />
                        }
                      </ListItemIcon>
                      <ListItemText 
                        primary="Entradas disponibles" 
                        secondary={event.availableTickets > 0 ? 
                          `${event.availableTickets} de ${event.capacity || '∞'}` : 
                          'Agotadas'
                        } 
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estadísticas
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Entradas vendidas" 
                    secondary={event.ticketsSold || 0} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Ingresos" 
                    secondary={`$${(event.ticketsSold * (event.price || 0)).toFixed(2)}`} 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información del sistema
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="ID del evento" 
                    secondary={event.id} 
                    secondaryTypographyProps={{ fontFamily: 'monospace' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Creado" 
                    secondary={formattedCreatedAt} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Última actualización" 
                    secondary={formattedUpdatedAt} 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EventDetailPage;
