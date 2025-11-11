// src/app/admin/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import LightLayout from '@/components/layouts/LightLayout';
import { Box, Container, Grid, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { EventService } from '@/services/EventService';
import type { EventForList } from '@/types/Event';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [events, setEvents] = useState<EventForList[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login?next=/admin/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (!isAuthenticated) return;
        setLoadingData(true);
        const res = await EventService.getEvents(1, 20);
        if (!active) return;
        setEvents(res.events || []);
      } finally {
        if (active) setLoadingData(false);
      }
    })();
    return () => { active = false; };
  }, [isAuthenticated]);

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return (
      <LightLayout title="Panel - TicketOffice">
        <Box display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </LightLayout>
    );
  }

  const upcoming = events.filter((e) => new Date(e.date).getTime() >= Date.now()).length;

  return (
    <LightLayout title="Panel - TicketOffice">
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>Bienvenido{user ? `, ${user.username}` : ''}</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Eventos</Typography>
              <Typography variant="h3">{loadingData ? '—' : events.length}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Próximos</Typography>
              <Typography variant="h3">{loadingData ? '—' : upcoming}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Ventas</Typography>
              <Typography variant="h3">—</Typography>
            </Paper>
          </Grid>
        </Grid>
        <Box sx={{ mt: 3 }}>
          <Button variant="contained" component={Link} href="/admin/events/new">Crear evento</Button>
          <Button variant="text" component={Link} href="/admin/events" sx={{ ml: 2 }}>Ver eventos</Button>
        </Box>
      </Container>
    </LightLayout>
  );
}
