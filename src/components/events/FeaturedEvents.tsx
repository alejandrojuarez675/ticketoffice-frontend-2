// src/components/events/FeaturedEvents.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Chip, Skeleton, Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import type { SearchEvent } from '@/types/search-event';
import { EventService } from '@/services/EventService';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

function FeaturedEventCard({ event }: { event: SearchEvent }) {
  const router = useRouter();

  return (
    <Card 
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('.buy-btn')) return;
        router.push(`/events/${event.id}`);
      }}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: 'rgba(24, 24, 27, 1)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'rgba(124, 58, 237, 0.5)',
          transform: 'translateY(-2px)',
          boxShadow: '0 0 20px rgba(124, 58, 237, 0.2)',
          '& .event-image': {
            transform: 'scale(1.05)',
          },
          '& .event-title': {
            color: 'rgba(167, 139, 250, 1)',
          },
          '& .buy-btn': {
            backgroundColor: 'rgba(139, 92, 246, 1)',
          },
        },
      }}
    >
      <Box sx={{ position: 'relative', height: 224, overflow: 'hidden' }}>
        <Box
          className="event-image"
          component="img" 
          src={event.bannerUrl || 'https://via.placeholder.com/800x450/6366f1/ffffff?text=Evento'} 
          alt={event.name} 
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.src = 'https://via.placeholder.com/800x450/6366f1/ffffff?text=Evento';
          }}
          sx={{ 
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }} 
        />
        {event.price === 0 && (
          <Box sx={{ position: 'absolute', bottom: 16, left: 16 }}>
            <Chip 
              label="GRATIS" 
              size="small"
              sx={{ 
                fontWeight: 'bold',
                fontSize: '0.625rem',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: 'rgba(52, 211, 153, 1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                backdropFilter: 'blur(12px)',
              }} 
            />
          </Box>
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography 
          className="event-title"
          gutterBottom 
          variant="h6" 
          component="h3"
          sx={{ 
            fontWeight: 500,
            color: 'white',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            mb: 2,
            transition: 'color 0.3s ease',
          }}
        >
          {event.name}
        </Typography>
        <Box sx={{ mt: 'auto', space: 'y-3' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <LocationOnIcon sx={{ fontSize: '1rem', color: 'rgba(161, 161, 170, 1)' }} />
            <Typography variant="body2" sx={{ color: 'rgba(161, 161, 170, 1)', fontSize: '0.875rem' }}>
              {event.location}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CalendarTodayIcon sx={{ fontSize: '0.9rem', color: 'rgba(161, 161, 170, 1)' }} />
            <Typography variant="body2" sx={{ color: 'rgba(161, 161, 170, 1)', fontSize: '0.875rem' }}>
              {new Date(event.date).toLocaleDateString('es-AR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
          </Box>
        </Box>
        {event.price !== 0 && (
          <Box 
            sx={{ 
              mt: 3,
              pt: 3,
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <Typography variant="body2" sx={{ color: 'rgba(161, 161, 170, 1)', fontSize: '0.75rem', mb: 0.5 }}>
              Desde
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
              {event.currency
                ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: /^[A-Z]{3}$/.test(event.currency) ? event.currency : 'ARS' }).format(
                    event.price
                  )
                : `$${event.price.toLocaleString('es-AR')}`}
            </Typography>
          </Box>
        )}
        <Box sx={{ mt: 3 }}>
          <Button
            className="buy-btn"
            fullWidth
            variant="contained"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/events/${event.id}`);
            }}
            sx={{
              color: 'white',
              fontWeight: 600,
              fontSize: '0.875rem',
              py: 1.5,
              textTransform: 'none',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(139, 92, 246, 1)',
                boxShadow: '0 6px 20px rgba(124, 58, 237, 0.5)',
              },
            }}
          >
            Comprar ahora
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function FeaturedEvents() {
  const [events, setEvents] = useState<SearchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Mostrar destacados combinando CO + AR y tomando los primeros 3
        const targets = ['Colombia', 'Argentina'];
        const reqs = await Promise.allSettled(
          targets.map((c) =>
            EventService.search({
              country: c,
              pageSize: 6,
              pageNumber: 0, // 0-based
            })
          )
        );

        const merged: SearchEvent[] = [];
        for (const r of reqs) {
          if (r.status === 'fulfilled' && Array.isArray((r.value).events)) {
            merged.push(...((r.value).events as SearchEvent[]));
          }
        }

        // de-duplicar por id y tomar top 3 por fecha más próxima
        const seen = new Set<string>();
        const dedup = merged.filter((e) => {
          if (!e?.id) return false;
          if (seen.has(e.id)) return false;
          seen.add(e.id);
          return true;
        });
        dedup.sort((a: SearchEvent, b: SearchEvent) => {
          const ta = a?.date ? new Date(a.date).getTime() : 0;
          const tb = b?.date ? new Date(b.date).getTime() : 0;
          return ta - tb;
        });

        setEvents(dedup.slice(0, 3));
      } catch (err) {
        setError('Error al cargar los eventos destacados');
         
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <Box sx={{ pt: 10, pb: 12, backgroundColor: 'transparent' }}>
      <Container>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 6 }}>
          <Typography 
            variant="h3" 
            component="h2"
            sx={{ 
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 600,
              color: 'white',
              letterSpacing: '-0.025em',
            }}
          >
            Eventos Destacados
          </Typography>
          <Button
            component={Link}
            href="/events"
            sx={{
              color: 'rgba(167, 139, 250, 1)',
              fontWeight: 500,
              fontSize: '0.875rem',
              textTransform: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(167, 139, 250, 0.1)',
              },
            }}
          >
            Ver todos
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              →
            </Box>
          </Button>
        </Box>

        {error && (
          <Typography variant="h6" color="error" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {loading ? (
          <Grid container spacing={4}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Card>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton width="60%" />
                    <Skeleton width="40%" />
                    <Skeleton width="80%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : events.length === 0 ? (
          <Typography variant="h6" align="center">
            No hay eventos disponibles en este momento.
          </Typography>
        ) : (
          <Grid container spacing={4}>
            {events.map((event) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={event.id}>
                <FeaturedEventCard event={event} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
