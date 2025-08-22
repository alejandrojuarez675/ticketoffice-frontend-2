'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardActionArea, CardContent, CardMedia, Skeleton } from '@mui/material';
import Grid from '@mui/material/Grid';
import { EventService } from '@/services/EventService';
import type { SearchEvent } from '@/types/search-event';
import { useRouter } from 'next/navigation';

export default function RelatedEvents({ city }: { city?: string }) {
  const router = useRouter();
  const [events, setEvents] = useState<SearchEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await EventService.searchEvents({ city, pageSize: 3, pageNumber: 1 });
        if (!active) return;
        setEvents(res.events);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [city]);

  if (loading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <Skeleton variant="rectangular" height={160} />
              <CardContent>
                <Skeleton width="60%" />
                <Skeleton width="40%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (events.length === 0) return null;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>Eventos relacionados</Typography>
      <Grid container spacing={2}>
        {events.map((e) => (
          <Grid key={e.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardActionArea onClick={() => router.push(`/events/${e.id}`)} sx={{ textAlign: 'left' }}>
                <CardMedia component="img" height="160" image={e.bannerUrl} alt={e.name} sx={{ objectFit: 'cover' }} />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="subtitle1">{e.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{e.location}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}