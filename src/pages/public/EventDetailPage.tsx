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
import { EventService } from '../../services/EventService';
import { EventDetail } from '../../types/Event';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const event = await EventService.getEventById(id!);
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

  const handleBuyTicket = () => {
    // Navigate to purchase page with event ID
    navigate(`/purchase/${id}`);
  };

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
      <Grid container spacing={3}>
        {/* Main Content Column */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                {/* Event Header */}
                <Grid item xs={12}>
                  <Typography variant="h4" gutterBottom>
                    {event.title}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    {new Date(event.date).toLocaleDateString('es-CO', { 
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
                {event.organizer && <Grid item xs={12}>
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
                </Grid> }
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Ticket Purchase Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', height: '100%' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>
                Comprar Entrada
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
                        {ticket.currency + ticket.value}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleBuyTicket}
                sx={{ mt: 2 }}
              >
                Comprar Ahora
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EventDetailPage;
