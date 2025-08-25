'use client';

import { useEffect, useState } from 'react';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import { Box, Card, CardContent, CircularProgress, Typography, Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import Link from 'next/link';
import { StatsService, type SellerSummary } from '@/services/StatsService';
import { useAuth } from '@/hooks/useAuth';

export default function SellerProfilePage() {
  const { user, isSeller, isAdmin, isLoading } = useAuth();
  const [summary, setSummary] = useState<SellerSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!isSeller && !isAdmin) return;
    (async () => {
      try {
        setLoading(true);
        const s = await StatsService.getSellerSummary(String(user?.id ?? 'me'));
        setSummary(s);
      } catch {
        setSummary({ totalEvents: 0, ticketsSold: 0, totalRevenue: 0 });
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoading, isSeller, isAdmin, user?.id]);

  return (
    <BackofficeLayout title="Mi perfil">
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
            {user?.name || 'Mi perfil'}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Eventos totales
                  </Typography>
                  <Typography variant="h4">{summary?.totalEvents ?? 0}</Typography>
                  <Button component={Link} href="/admin/events" size="small" sx={{ mt: 1 }}>
                    Ver todos mis eventos
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tickets vendidos
                  </Typography>
                  <Typography variant="h4">{summary?.ticketsSold ?? 0}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ingresos totales
                  </Typography>
                  <Typography variant="h4">${(summary?.totalRevenue ?? 0).toLocaleString()}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </BackofficeLayout>
  );
}