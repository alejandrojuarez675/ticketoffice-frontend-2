import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  Divider
} from '@mui/material';
import { EventService } from '../services/EventService';
import { EventDetail } from '../types/EventDetail';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const event = await EventService.getMockEventById(id!);
        setEvent(event);
      } catch (err) {
        setError('Error al cargar los detalles del evento');
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5">Cargando detalles del evento...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  if (!event) {
    return <div>No se encontró el evento</div>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {/* Event Header */}
            <Grid item xs={12}>
              <Typography variant="h4" gutterBottom>
                {event.title}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {event.date.toLocaleDateString('es-CO', { 
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </Grid>

            {/* Location */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Ubicación
                </Typography>
                <Typography variant="body1">
                  {event.location.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.location.address}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.location.city}, {event.location.country}
                </Typography>
              </Paper>
            </Grid>

            {/* Event Image */}
            <Grid item xs={12}>
              <img 
                src={event.image.url} 
                alt={event.image.alt} 
                style={{ width: '100%', height: 'auto', borderRadius: '8px' }} 
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <Typography variant="body1" paragraph>
                {event.description}
              </Typography>
            </Grid>

            {/* Additional Info */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Información Adicional
              </Typography>
              <List>
                {event.additionalInfo.map((info, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <ArrowForwardIcon />
                    </ListItemIcon>
                    <ListItemText primary={info} />
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Organizer */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Organizador
                </Typography>
                <Typography variant="body1">
                  {event.organizer.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <a href={event.organizer.url} target="_blank" rel="noopener noreferrer">
                    Visitar sitio web
                  </a>
                </Typography>
              </Paper>
            </Grid>

            {/* Tickets */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Boletas Disponibles
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {event.tickets.map((ticket) => (
                <Paper key={ticket.id} sx={{ p: 2, mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle1">
                        {ticket.type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Stock: {ticket.stock}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6" align="right">
                        {ticket.value.toLocaleString('es-CO', {
                          style: 'currency',
                          currency: ticket.currency
                        })}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EventDetailPage;
