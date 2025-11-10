// src/app/admin/profile/page.tsx
'use client';

import React from 'react';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import Link from 'next/link';
import { AuthService } from '@/services/AuthService';

export default function SellerProfilePage() {
  const user = AuthService.getCurrentUser();

  return (
    <BackofficeLayout title="Mi perfil">
      <Box>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
          {user?.name || user?.username || 'Mi perfil'}
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Rol
                </Typography>
                <Typography variant="h5" sx={{ textTransform: 'capitalize' }}>
                  {user?.role || 'usuario'}
                </Typography>
                <Button component={Link} href="/admin/events" size="small" sx={{ mt: 1 }}>
                  Ver mis eventos
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="h6">{user?.email || '—'}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Próximamente
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Resumen de ventas y métricas (no incluido en MVP).
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </BackofficeLayout>
  );
}
