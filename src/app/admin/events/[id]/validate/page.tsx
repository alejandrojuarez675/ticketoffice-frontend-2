'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Box, Button, TextField, Typography, Paper, 
  CircularProgress, Dialog, DialogTitle, DialogContent, 
  DialogContentText, DialogActions, IconButton, Container,
  useTheme, useMediaQuery, Alert, Card, CardHeader, Avatar, Snackbar
} from '@mui/material';
import { QrCodeScanner as QrCodeScannerIcon, CheckCircle, Error, Event as EventIcon } from '@mui/icons-material';
import { ValidatorService } from '@/services/ValidatorService';
import { AuthService } from '@/services/AuthService';
import { EventService } from '@/services/EventService';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import type { EventDetail } from '@/types/Event';

const EventTicketValidationPage = () => {
  const router = useRouter();
  const { id: eventId } = useParams<{ id: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [ticketId, setTicketId] = useState('');
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    message: string;
    ticketId?: string;
  } | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>(
    { open: false, message: '' }
  );

  // Fetch event details and enforce seller ownership
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventData = await EventService.getEventById(eventId);
        // If current user is a seller, ensure they own the event
        const current = AuthService.getCurrentUser();
        const isSeller = AuthService.isSeller();
        if (isSeller && current && eventData?.organizer?.id && eventData.organizer.id !== String(current.id)) {
          setSnackbar({ open: true, message: 'No tienes acceso para validar entradas de este evento.' });
          router.replace('/admin/events');
          return;
        }
        setEvent(eventData);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setEventLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, router]);

  // Auth check
  useEffect(() => {
    if (typeof window !== 'undefined' && !AuthService.isAuthenticated()) {
      router.push('/auth/login');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId.trim()) return;

    setLoading(true);
    try {
      await ValidatorService.validateTicket(eventId, ticketId);
      setValidationResult({
        success: true,
        message: '¡Entrada validada exitosamente para este evento!',
        ticketId
      });
    } catch {
      setValidationResult({
        success: false,
        message: 'Error al validar la entrada. Verifica el código del ticket.',
        ticketId
      });
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
          <Alert severity="error">
            No se pudo cargar la información del evento. Por favor, inténtalo de nuevo.
          </Alert>
        </Container>
      </BackofficeLayout>
    );
  }

  return (
    <BackofficeLayout title={`Validar Entrada - ${event.title}`}>
      <Container maxWidth="sm">
        <Card sx={{ mb: 3 }}>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                <EventIcon />
              </Avatar>
            }
            title={event.title}
            subheader={new Date(event.date).toLocaleDateString('es-AR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          />
        </Card>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ textAlign: 'center' }}>
            <QrCodeScannerIcon color="primary" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" gutterBottom>Validar Entrada</Typography>
            <Typography color="text.secondary" mb={3}>
              Ingresa el código del ticket para validar la entrada
            </Typography>
            
            <TextField
              fullWidth
              variant="outlined"
              label="Código del ticket"
              placeholder="Ej: ABC123XYZ"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              disabled={loading}
              helperText="Ingresa solo el código del ticket"
              InputProps={{
                endAdornment: (
                  <IconButton 
                    onClick={() => alert('Escaner QR - Próximamente')}
                    edge="end"
                  >
                    <QrCodeScannerIcon />
                  </IconButton>
                ),
              }}
              autoFocus
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading || !ticketId.trim()}
              fullWidth
              sx={{ mt: 3, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Validar Entrada'}
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Result Modal */}
      <Dialog
        open={!!validationResult}
        onClose={() => setValidationResult(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1.5,
          color: validationResult?.success ? 'success.main' : 'error.main'
        }}>
          {validationResult?.success ? (
            <>
              <CheckCircle color="success" fontSize="large" />
              <span>¡Entrada Válida!</span>
            </>
          ) : (
            <>
              <Error color="error" fontSize="large" />
              <span>Validación Fallida</span>
            </>
          )}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {validationResult?.message}
          </DialogContentText>
          
          {validationResult?.ticketId && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                ID del Ticket: <strong>{validationResult.ticketId}</strong>
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
            color="primary"
            fullWidth={isMobile}
          >
            Validar Otra Entrada
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
};

export default EventTicketValidationPage;
