import React, { Suspense } from 'react';
import { Box, Button, Card, CardContent, Container, Typography, LinearProgress, Skeleton } from '@mui/material';
import LightLayout from '@/components/layouts/LightLayout';
import Link from 'next/link';
import CongratsClient from './CongratsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function CheckoutCongratsPage() {
  return (
    <LightLayout title="¡Gracias por tu compra!">
      <Suspense fallback={<CongratsFallback />}>
        <CongratsClient />
      </Suspense>
    </LightLayout>
  );
}

function CongratsFallback() {
  return (
    <Container sx={{ py: 6 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>¡Felicitaciones!</Typography>
          <Typography color="text.secondary" paragraph>Cargando detalles de tu compra…</Typography>
          <LinearProgress />
          <Box sx={{ mt: 2 }}>
            <Skeleton variant="rectangular" height={48} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={48} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={48} />
          </Box>
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" component={Link} href="/">Ir al inicio</Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}