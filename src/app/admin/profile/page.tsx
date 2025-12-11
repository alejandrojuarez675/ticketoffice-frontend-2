// src/app/admin/profile/page.tsx
'use client';

import React, { useEffect } from 'react';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import { Box, Card, CardContent, Typography, Button, Skeleton, Alert, Stack, Chip } from '@mui/material';
import Grid from '@mui/material/Grid';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import EventIcon from '@mui/icons-material/Event';

export default function SellerProfilePage() {
  const { user, isLoading, isAuthenticated, refresh } = useAuth();
  const router = useRouter();

  // Refresh user data on mount
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?next=/admin/profile');
    }
  }, [isLoading, isAuthenticated, router]);

  // Refresh user data when component mounts
  useEffect(() => {
    refresh();
  }, []);

  if (isLoading) {
    return (
      <BackofficeLayout title="Mi perfil">
        <Box>
          <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {[1, 2, 3].map((i) => (
              <Grid key={i} size={{ xs: 12, sm: 4 }}>
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </BackofficeLayout>
    );
  }

  if (!user) {
    return (
      <BackofficeLayout title="Mi perfil">
        <Alert severity="warning">
          No se pudo cargar tu perfil. Por favor, inicia sesión nuevamente.
        </Alert>
      </BackofficeLayout>
    );
  }

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'seller': return 'Organizador';
      case 'user': return 'Usuario';
      default: return 'Usuario';
    }
  };

  const getRoleColor = (role?: string): 'primary' | 'secondary' | 'default' => {
    switch (role) {
      case 'admin': return 'secondary';
      case 'seller': return 'primary';
      default: return 'default';
    }
  };

  return (
    <BackofficeLayout title="Mi perfil">
      <Box>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              ¡Hola, {user.name || user.username}!
            </Typography>
            <Chip 
              label={getRoleLabel(user.role)} 
              color={getRoleColor(user.role)} 
              size="small" 
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <BadgeIcon color="primary" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Usuario
                  </Typography>
                </Stack>
                <Typography variant="h5">
                  {user.username}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <EmailIcon color="primary" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                </Stack>
                <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>
                  {user.email || '—'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <EventIcon color="primary" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Mis Eventos
                  </Typography>
                </Stack>
                <Button 
                  component={Link} 
                  href="/admin/events" 
                  variant="contained" 
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Ver mis eventos
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Acciones rápidas
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button 
              component={Link} 
              href="/admin/events/new" 
              variant="outlined"
            >
              Crear nuevo evento
            </Button>
            <Button 
              component={Link} 
              href="/admin/dashboard" 
              variant="outlined"
            >
              Ir al dashboard
            </Button>
          </Stack>
        </Box>
      </Box>
    </BackofficeLayout>
  );
}
