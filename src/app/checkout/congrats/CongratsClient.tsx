'use client';

import React from 'react';
import { Box, Button, Card, CardContent, Container, Typography, LinearProgress } from '@mui/material';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function CongratsClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId') ?? '';
  const status = (searchParams.get('status') || '').toLowerCase();
  const isPending = status === 'pending';

  return (
    <Container sx={{ py: 6 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>¡Felicitaciones!</Typography>
          <Typography color="text.secondary" paragraph>
            Tu compra ha sido registrada{sessionId ? ` (sesión ${sessionId})` : ''}.
          </Typography>

          {isPending && (
            <Box sx={{ mb: 3 }}>
              <Typography color="text.secondary" paragraph>
                Estamos confirmando tu pago con el proveedor. Esto puede demorar unos minutos.
              </Typography>
              <LinearProgress />
            </Box>
          )}

          <Typography paragraph>
            Te enviaremos tus entradas al correo proporcionado. Si no ves el correo, revisa la carpeta de spam.
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Button variant="contained" component={Link} href="/">Ir al inicio</Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}