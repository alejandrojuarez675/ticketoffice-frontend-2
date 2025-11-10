// src/app/admin/events/validate/page.tsx
'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  ContentCopy as ContentCopyIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  QrCodeScanner as QrCodeScannerIcon,
} from '@mui/icons-material';
import Loading from '@/components/common/Loading';
import { AuthService } from '@/services/AuthService';
import { EventService } from '@/services/EventService';
import type { EventDetail } from '@/types/Event';
import { SalesService } from '@/services/SalesService';
import { ConfigService } from '@/services/ConfigService';

export const dynamic = 'force-dynamic';

type ValidatedSale = {
  id: string;
  ticketType?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  price?: number;
  validated: boolean;
  validatedAt?: string;
};

export default function EventTicketValidationPage() {
  return (
    <BackofficeLayout title="Validar Entradas">
      <Suspense fallback={<Loading minHeight="40vh" />}>
        <EventTicketValidationContent />
      </Suspense>
    </BackofficeLayout>
  );
}

function EventTicketValidationContent() {
  const search = useSearchParams();
  const eventId = search.get('eventId') || undefined;
  const preSaleId = search.get('saleId') || undefined;

  const router = useRouter();

  const [ticketId, setTicketId] = useState('');
  const [sale, setSale] = useState<ValidatedSale | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [eventLoading, setEventLoading] = useState<boolean>(!!eventId);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.replace(`/auth/login?next=${encodeURIComponent('/admin/events/validate' + (eventId ? `?eventId=${eventId}` : ''))}`);
      return;
    }
    if (!(AuthService.isAdmin() || AuthService.isSeller())) {
      router.replace('/');
      return;
    }
  }, [router, eventId]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!eventId) return;
      try {
        setEventLoading(true);
        const ev = await EventService.getEventById(eventId);
        if (!active) return;
        setEvent(ev);
      } catch {
        if (active) {
          setEvent(null);
          setSnackbar({ open: true, message: 'Error al cargar los datos del evento', severity: 'error' });
        }
      } finally {
        if (active) setEventLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [eventId]);

  useEffect(() => {
    if (!preSaleId || isSubmitting) return;
    setTicketId(preSaleId);
    void handleValidateTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preSaleId]);

  const handleValidateTicket = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const idToValidate = ticketId.trim();
    if (!idToValidate) return;

    try {
      setIsSubmitting(true);

      if (ConfigService.isMockedEnabled()) {
        // MOCK: buscamos entre ventas del evento (si hay eventId) o devolvemos OK
        let ok = true;
        if (eventId) {
          const rows = await (await SalesService.list({ eventId })).slice(0, 100);
          ok = rows.some((r) => r.id === idToValidate || r.orderId === idToValidate);
        }
        if (!ok) {
          setSnackbar({ open: true, message: 'Entrada/venta no encontrada', severity: 'warning' });
          return;
        }
        setSale({ id: idToValidate, validated: true, validatedAt: new Date().toISOString() });
        setOpenDialog(true);
        setSnackbar({ open: true, message: 'Entrada validada correctamente (mock)', severity: 'success' });
        return;
      }

      if (!eventId) {
        setSnackbar({ open: true, message: 'Selecciona un evento para validar (eventId requerido)', severity: 'warning' });
        return;
      }

      await SalesService.validate(eventId, idToValidate);
      setSale({ id: idToValidate, validated: true, validatedAt: new Date().toISOString() });
      setOpenDialog(true);
      setSnackbar({ open: true, message: 'Entrada validada correctamente', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Error al validar el ticket. Intente nuevamente.', severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScanSuccess = (scanned: string) => {
    setTicketId(scanned);
    setScannerOpen(false);
    void handleValidateTicket();
  };

  const handleCopyToClipboard = () => {
    if (!ticketId) return;
    navigator.clipboard.writeText(ticketId);
    setSnackbar({ open: true, message: 'ID copiado al portapapeles', severity: 'info' });
  };

  if (eventId && eventLoading) {
    return <Loading minHeight="60vh" />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => router.push(eventId ? `/admin/events/${eventId}` : '/admin/events')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Validar Entradas{event ? ` - ${event.title}` : ''}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            {event ? (
              <CardMedia component="img" height="200" image={event.image?.url || '/placeholder-event.jpg'} alt={event.title} />
            ) : (
              <Box
                sx={{
                  height: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'action.hover',
                }}
              >
                <EventIcon color="action" sx={{ fontSize: 40 }} />
              </Box>
            )}
            <CardContent>
              {event ? (
                <>
                  <Typography variant="h6" gutterBottom>
                    {event.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      {event.location?.city || 'Ubicación no especificada'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(event.date).toLocaleString('es-AR')}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                </>
              ) : (
                <>
                  <Typography variant="h6" gutterBottom>
                    Validación sin evento asignado
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Puedes validar ingresando el ID de la venta o del ticket. Para el MVP, si quieres validar en el backend necesitas pasar eventId.
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                </>
              )}

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Instrucciones:
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                1. Ingresa el ID del ticket/venta o escanea el QR.
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                2. Presiona &ldquo;Validar&rdquo;.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                3. Revisa el resultado.
              </Typography>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button variant="outlined" startIcon={<QrCodeScannerIcon />} onClick={() => setScannerOpen(true)} fullWidth sx={{ mb: 2 }}>
                  Escanear Código QR
                </Button>
                <Button
                  variant="contained"
                  onClick={() => router.push(eventId ? `/admin/events/${eventId}` : '/admin/events')}
                  fullWidth
                >
                  Volver
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Validar Entrada
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box component="form" onSubmit={handleValidateTicket} sx={{ mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, md: 8 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="ID del Ticket o Venta"
                      value={ticketId}
                      onChange={(e) => setTicketId(e.target.value)}
                      placeholder="Ingrese el ID o escanee el código QR"
                      slotProps={{
                        input: {
                          endAdornment: ticketId ? (
                            <InputAdornment position="end">
                              <IconButton onClick={handleCopyToClipboard} size="small" edge="end" title="Copiar ID">
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </InputAdornment>
                          ) : undefined,
                        },
                      }}
                    />
                  </Grid>
                  <Grid>
                    <Button type="submit" variant="contained" disabled={!ticketId.trim() || isSubmitting} sx={{ height: '56px' }}>
                      {isSubmitting ? <CircularProgress size={24} /> : 'Validar'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderStyle: 'dashed',
                  borderColor: 'divider',
                  backgroundColor: 'action.hover',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.selected' },
                }}
                onClick={() => setScannerOpen(true)}
              >
                <QrCodeScannerIcon color="action" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Escanear Código QR
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Haz clic aquí para abrir el escáner (simulado en MVP).
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{sale?.validated ? 'Entrada Validada' : 'Resultado de Validación'}</DialogTitle>
        <DialogContent>
          {sale ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Detalles
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2">ID</Typography>
                  <Typography variant="body1" gutterBottom>
                    {sale.id}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Estado</Typography>
                  <Chip
                    label={sale.validated ? 'Validada' : 'No validada'}
                    color={sale.validated ? 'success' : 'default'}
                    icon={sale.validated ? <CheckCircleIcon /> : undefined}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                {sale.validatedAt && (
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Typography variant="subtitle2">Fecha de Validación</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(sale.validatedAt).toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          ) : (
            <Typography>Intenta nuevamente con un ID válido.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={scannerOpen} onClose={() => setScannerOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Escanear Código QR</DialogTitle>
        <DialogContent sx={{ textAlign: 'center', p: 4 }}>
          <Box
            sx={{
              width: '100%',
              height: 300,
              bgcolor: 'black',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mb: 2,
              borderRadius: 1,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 200,
                height: 200,
                border: '2px solid white',
                borderRadius: 1,
                zIndex: 1,
              }}
            />
            <Typography variant="body1" color="white">
              Vista previa del escáner (MVP)
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">Simulación de escaneo disponible en MVP.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScannerOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={() => handleScanSuccess('mock-scanned-ticket-id')} variant="contained">
            Simular Escaneo
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
