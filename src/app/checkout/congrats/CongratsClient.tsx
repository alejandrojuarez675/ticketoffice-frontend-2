'use client';

import React from 'react';
import { Box, Button, Card, CardContent, Container, Typography, LinearProgress, Stack } from '@mui/material';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import EmailIcon from '@mui/icons-material/Email';

export default function CongratsClient() {
  const searchParams = useSearchParams();
  const status = (searchParams.get('status') || '').toLowerCase();
  const isPending = status === 'pending';
  const isApproved = status === 'approved' || status === '';

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card sx={{ textAlign: 'center', py: 3 }}>
        <CardContent>
          {/* Icono de éxito */}
          <Box sx={{ mb: 3 }}>
            <CheckCircleOutlineIcon 
              sx={{ 
                fontSize: 80, 
                color: isApproved ? 'success.main' : 'warning.main' 
              }} 
            />
          </Box>

          <Typography variant="h4" gutterBottom fontWeight="bold">
            {isApproved ? '¡Felicitaciones!' : '¡Casi listo!'}
          </Typography>

          <Typography variant="h6" color="text.secondary" paragraph>
            {isApproved 
              ? 'Tu compra ha sido procesada exitosamente.' 
              : 'Tu compra está siendo procesada.'}
          </Typography>

          {isPending && (
            <Box sx={{ mb: 3, px: 2 }}>
              <Typography color="text.secondary" paragraph>
                Estamos confirmando tu pago con el proveedor. Esto puede demorar unos minutos.
              </Typography>
              <LinearProgress color="warning" />
            </Box>
          )}

          {/* Información de próximos pasos */}
          <Stack spacing={2} sx={{ mt: 3, mb: 4, textAlign: 'left', px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <EmailIcon color="primary" />
              <Typography variant="body1">
                Recibirás un correo con la confirmación de tu compra.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ConfirmationNumberIcon color="primary" />
              <Typography variant="body1">
                Tus entradas digitales llegarán al correo proporcionado.
              </Typography>
            </Box>
          </Stack>

          <Typography variant="body2" color="text.secondary" paragraph>
            Si no ves el correo en unos minutos, revisa tu carpeta de spam o correo no deseado.
          </Typography>

          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" component={Link} href="/" size="large">
              Ir al inicio
            </Button>
            <Button variant="outlined" component={Link} href="/events" size="large">
              Ver más eventos
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}