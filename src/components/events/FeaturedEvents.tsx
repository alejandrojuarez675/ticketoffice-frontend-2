// src/components/events/FeaturedEvents.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardContent, CardMedia, CardActionArea, Skeleton } from '@mui/material';
import Grid from '@mui/material/Grid';
import type { SearchEvent } from '@/types/search-event';
import { EventService } from '@/services/EventService';
import { useRouter } from 'next/navigation';

function FeaturedEventCard({ event }: { event: SearchEvent }) {
  const router = useRouter();
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={() => router.push(`/events/${event.id}`)} sx={{ display: 'block', textAlign: 'left' }}>
        <CardMedia component="img" height="200" image={event.bannerUrl} alt={event.name} sx={{ objectFit: 'cover' }} />
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
            {event.currency
              ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: /^[A-Z]{3}$/.test(event.currency) ? event.currency : 'ARS' }).format(
                  event.price
                )
              : `$${event.price.toLocaleString('es-AR')}`}
          </Typography>
        </CardContent>
      </CardActionArea>
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
    <Box sx={{ py: 8, backgroundColor: 'background.default' }}>
      <Container>
        <Typography variant="h3" component="h2" gutterBottom align="center" sx={{ mb: 6 }}>
          Eventos Destacados
        </Typography>

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
