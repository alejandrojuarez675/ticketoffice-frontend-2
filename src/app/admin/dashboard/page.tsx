// src/app/admin/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import { Box, Grid, Typography, Button, CircularProgress, Card, CardContent, Stack, Chip, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { EventService } from '@/services/EventService';
import type { EventForList } from '@/types/Event';
import Link from 'next/link';
import EventIcon from '@mui/icons-material/Event';
import UpcomingIcon from '@mui/icons-material/Schedule';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import CelebrationIcon from '@mui/icons-material/Celebration';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [events, setEvents] = useState<EventForList[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(null);
        const res = await EventService.getEvents(1, 20);
        if (!active) return;
        setEvents(res.events || []);
      } catch (err) {
        console.error('Error loading events:', err);
        if (active) setError('Error al cargar los eventos');
      } finally {
        if (active) setLoadingData(false);
      }
    })();
    return () => { active = false; };
  }, [isAuthenticated]);

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return (
      <BackofficeLayout title="Panel">
        <Box display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </BackofficeLayout>
    );
  }

  const upcoming = events.filter((e) => new Date(e.date).getTime() >= Date.now()).length;
  const hasEvents = events.length > 0;

  return (
    <BackofficeLayout title="Dashboard">
      <Box>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
          ¡Hola, {user?.name || user?.username}! 👋
        </Typography>

        {/* Métricas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <EventIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Eventos
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {loadingData ? '—' : events.length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <UpcomingIcon sx={{ fontSize: 40, color: 'success.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Próximos
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {loadingData ? '—' : upcoming}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <ConfirmationNumberIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Ventas Totales
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      — <Chip label="Próximamente" size="small" />
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Acciones Rápidas */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Acciones Rápidas
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                component={Link}
                href="/admin/events/new"
                startIcon={<AddIcon />}
                size="large"
              >
                Crear nuevo evento
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href="/admin/events"
                startIcon={<ListIcon />}
                size="large"
                disabled={!hasEvents}
              >
                {hasEvents ? 'Ver mis eventos' : 'No tienes eventos aún'}
              </Button>
            </Stack>

            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}

            {!hasEvents && !loadingData && !error && (
              <Card sx={{ mt: 3, bgcolor: 'primary.50', border: '2px dashed', borderColor: 'primary.main' }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <CelebrationIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h5" gutterBottom fontWeight="bold" color="primary.main">
                    ¡Comienza creando tu primer evento!
                  </Typography>
                  <Typography variant="body1" color="text.primary" sx={{ mb: 3 }}>
                    Aún no tienes eventos. Crea tu primer evento para empezar a vender entradas.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    component={Link}
                    href="/admin/events/new"
                    startIcon={<AddIcon />}
                  >
                    Crear mi primer evento
                  </Button>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </Box>
    </BackofficeLayout>
  );
}
