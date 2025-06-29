import React from 'react';
import { Box, Container, Grid, Card, CardContent, Typography, CardMedia, Link as MuiLink } from '@mui/material';
import { SearchEvent } from '../types/SearchEvent';
import { useNavigate } from 'react-router-dom';
import { EventService } from '../services/EventService';

interface FeaturedEventsProps {
  events: SearchEvent[];
}

const FeaturedEventCard: React.FC<{ event: SearchEvent }> = ({ event }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/events/${event.id}`);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 6,
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
        }
      }}
      onClick={handleCardClick}
    >
      <CardMedia
        component="img"
        height="200"
        image={event.bannerUrl}
        alt={event.name}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2">
          {event.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {event.location}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {new Date(event.date).toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Typography>
        <Typography variant="h6" color="primary">
          ${event.price.toLocaleString('es-AR')} {event.currency}
        </Typography>
      </CardContent>
    </Card>
  );
};

const FeaturedEvents: React.FC = () => {
  const [events, setEvents] = React.useState<SearchEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        const params = {
          country: 'Argentina',
          pageSize: 3,
          pageNumber: 1
        };
        const response = await EventService.searchEvents(params);
        setEvents(response.events);
      } catch (err) {
        setError('Error al cargar los eventos destacados');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <Box sx={{ py: 4 }}>
        <Container>
          <Typography variant="h2" gutterBottom align="center">
            Cargando eventos destacados...
          </Typography>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <Container>
          <Typography variant="h2" gutterBottom align="center" color="error">
            {error}
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, backgroundColor: 'background.paper' }}>
      <Container>
        <Typography variant="h2" gutterBottom align="center" sx={{ mb: 4 }}>
          Eventos Destacados en Argentina
        </Typography>
        <Grid container spacing={4}>
          {events.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <FeaturedEventCard event={event} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturedEvents;
