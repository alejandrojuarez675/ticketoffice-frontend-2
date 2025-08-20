'use client';

import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Card, CardContent, Typography, CardMedia } from '@mui/material';
import type { SearchEvent } from '@/types/search-event';
import { EventService } from '@/services/EventService';
import { useRouter } from 'next/navigation';

interface FeaturedEventCardProps {
  event: SearchEvent;
}

const FeaturedEventCard: React.FC<FeaturedEventCardProps> = ({ event }) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/events/${event.id}`);
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
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        },
      }}
      onClick={handleCardClick}
    >
      <CardMedia
        component="img"
        height="200"
        image={event.bannerUrl}
        alt={event.name}
        sx={{
          objectFit: 'cover',
        }}
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
            minute: '2-digit',
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
  const [events, setEvents] = useState<SearchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const params = {
          country: 'Argentina',
          pageSize: 3,
          pageNumber: 1,
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
      <Box sx={{ py: 8, backgroundColor: 'background.default' }}>
        <Container>
          <Typography variant="h4" gutterBottom align="center">
            Cargando eventos destacados...
          </Typography>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 8, backgroundColor: 'background.default' }}>
        <Container>
          <Typography variant="h6" color="error" align="center">
            {error}
          </Typography>
        </Container>
      </Box>
    );
  }

  if (events.length === 0) {
    return (
      <Box sx={{ py: 8, backgroundColor: 'background.default' }}>
        <Container>
          <Typography variant="h6" align="center">
            No hay eventos disponibles en este momento.
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 8, backgroundColor: 'background.default' }}>
      <Container>
        <Typography variant="h3" component="h2" gutterBottom align="center" sx={{ mb: 6 }}>
          Eventos Destacados
        </Typography>
        <Grid container spacing={4}>
          {events.map((event) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={event.id}>
              <FeaturedEventCard event={event} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturedEvents;
