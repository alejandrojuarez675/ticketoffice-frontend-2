// src/app/admin/events/[id]/validate/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Container,
  Alert,
  Card,
  CardHeader,
  Avatar,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
} from '@mui/material';
import { QrCodeScanner as QrCodeScannerIcon, CheckCircle, Error, Event as EventIcon } from '@mui/icons-material';
import { AuthService } from '@/services/AuthService';
import { EventService } from '@/services/EventService';
import { SalesService } from '@/services/SalesService';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import type { EventDetail } from '@/types/Event';

export default function EventTicketValidationPage() {
  const router = useRouter();
  const { id: eventId } = useParams<{ id: string }>();

  const [ticketId, setTicketId] = useState('');
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [validationResult, setValidationResult] = useState<{ success: boolean; message: string; ticketId?: string } | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.replace('/auth/login?next=' + encodeURIComponent(`/admin/events/${eventId}/validate`));
      return;
    }
    (async () => {
      try {
        const eventData = await EventService.getEventById(eventId);
        setEvent(eventData);
      } catch {
        setSnackbar({ open: true, message: 'No se pudo cargar la información del evento.' });
      } finally {
        setEventLoading(false);
      }
    })();
  }, [eventId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId.trim()) return;

    setLoading(true);
    try {
      await SalesService.validate(eventId, ticketId.trim());
      setValidationResult({ success: true, message: '¡Entrada validada exitosamente!', ticketId });
    } catch {
      setValidationResult({ success: false, message: 'No se pudo validar la entrada. Verifica el código.', ticketId });
    } finally {
      setLoading(false);
    }
  };

  if (eventLoading) {
    return (
      <BackofficeLayout title="Validar Entrada">
        <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography>Cargando información del evento...</Typography>
        </Container>
      </BackofficeLayout>
    );
  }

  if (!event) {
    return (
      <BackofficeLayout title="Evento no encontrado">
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Alert severity="error">No se pudo cargar la información del evento. Por favor, inténtalo de nuevo.</Alert>
        </Container>
      </BackofficeLayout>
    );
  }

  return (
    <BackofficeLayout title={`Validar Entrada - ${event.title}`}>
      <Container maxWidth="sm">
        <Card sx={{ mb: 3 }}>
          <CardHeader avatar={<Avatar>{<EventIcon />}</Avatar>} title={event.title} subheader={new Date(event.date).toLocaleString('es-AR')} />
        </Card>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ textAlign: 'center' }}>
            <QrCodeScannerIcon color="primary" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Validar Entrada
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Ingresa el ID de la venta (saleId) para validar
            </Typography>

            <TextField
              fullWidth
              variant="outlined"
              label="ID de venta"
              placeholder="Ej: 123e4567-e89b-12d3-a456-426614174000"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => alert('Escáner QR — próximamente')} edge="end">
                    <QrCodeScannerIcon />
                  </IconButton>
                ),
              }}
              autoFocus
            />

            <Button type="submit" variant="contained" size="large" disabled={loading || !ticketId.trim()} fullWidth sx={{ mt: 3 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Validar'}
            </Button>
          </Box>
        </Paper>
      </Container>

      <Dialog open={!!validationResult} onClose={() => setValidationResult(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: validationResult?.success ? 'success.main' : 'error.main' }}>
          {validationResult?.success ? (
            <>
              <CheckCircle color="success" /> <span>¡Entrada válida!</span>
            </>
          ) : (
            <>
              <Error color="error" /> <span>Validación fallida</span>
            </>
          )}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{validationResult?.message}</DialogContentText>
          {validationResult?.ticketId && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                ID: <strong>{validationResult.ticketId}</strong>
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setValidationResult(null);
              setTicketId('');
            }}
            variant="contained"
          >
            Validar otra
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </BackofficeLayout>
  );
}
