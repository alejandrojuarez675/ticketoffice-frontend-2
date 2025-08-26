'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery,
  IconButton,
  Chip,
  Snackbar,
  Alert,
  InputAdornment,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import {
  QrCodeScanner as QrCodeScannerIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import { EventService } from '@/services/EventService';
import { SalesService, type SaleRecord } from '@/services/SalesService';
import type { EventDetail } from '@/types/Event';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/common/Loading';

type ValidatedSale = {
  id: string;
  ticketType: string;
  firstName: string;
  lastName: string;
  email: string;
  price: number;
  validated: boolean;
  validatedAt?: string;
  eventId?: string;
};

function formatDate(dateString: string) {
  return format(new Date(dateString), "EEEE d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
}

function mapSaleRecordToValidated(r: SaleRecord): ValidatedSale {
  return {
    id: r.id,
    ticketType: r.couponCode ? 'General (c/ cupón)' : 'General',
    firstName: '',
    lastName: '',
    email: r.buyerEmail,
    price: r.unitPrice,
    validated: true,
    validatedAt: new Date().toISOString(),
    eventId: r.eventId,
  };
}

function SalesValidationContent() {
  const { saleId } = useParams<{ saleId: string }>();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, isAdmin, isSeller, isLoading, user } = useAuth();

  const [ticketId, setTicketId] = useState('');
  const [sale, setSale] = useState<ValidatedSale | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [eventLoading, setEventLoading] = useState(false);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  // Guard de autenticación
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/auth/login?next=' + encodeURIComponent(`/admin/validate/${saleId}`));
      return;
    }
    if (!(isAdmin || isSeller)) {
      router.replace('/');
      return;
    }
  }, [isLoading, isAuthenticated, isAdmin, isSeller, router, saleId]);

  // Autovalidar usando el saleId del path
  useEffect(() => {
    if (!saleId || submitting) return;
    setTicketId(String(saleId));
    void handleValidateTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saleId]);

  // Carga de datos del evento cuando tengamos venta con eventId
  useEffect(() => {
    let active = true;
    (async () => {
      if (!sale?.eventId) return;
      try {
        setEventLoading(true);
        const ev = await EventService.getEventById(sale.eventId);
        if (!active) return;
        setEvent(ev);
        // Si es vendedor, validar que el evento le pertenezca
        if (isSeller && ev?.organizer?.id && user?.id && ev.organizer.id !== String(user.id)) {
          setSnackbar({ open: true, message: 'No tienes permiso para validar entradas de este evento', severity: 'error' });
          router.replace('/admin/events');
          return;
        }
      } catch {
        if (active) setEvent(null);
      } finally {
        if (active) setEventLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [sale?.eventId, isSeller, user?.id, router]);

  const handleCloseDialog = () => setOpenDialog(false);

  const handleValidateTicket = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const idToValidate = ticketId.trim();
    if (!idToValidate) return;

    try {
      setSubmitting(true);
      // Mock: buscar por id de venta o por orderId
      const rows = await SalesService.list({});
      const found = rows.find((r) => r.id === idToValidate || r.orderId === idToValidate);
      if (!found) {
        setSnackbar({ open: true, message: 'Venta/entrada no encontrada', severity: 'warning' });
        return;
      }
      const v = mapSaleRecordToValidated(found);
      setSale(v);
      setOpenDialog(true);
      setSnackbar({ open: true, message: 'Entrada validada correctamente (mock)', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Error al validar. Intente nuevamente.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleScanSuccess = (scannedTicketId: string) => {
    setTicketId(scannedTicketId);
    setScannerOpen(false);
    void handleValidateTicket();
  };

  const handleCopyToClipboard = () => {
    if (!ticketId) return;
    navigator.clipboard.writeText(ticketId);
    setSnackbar({ open: true, message: 'ID copiado al portapapeles', severity: 'info' });
  };

  if (isLoading) {
    return <Loading minHeight="60vh" />;
  }

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => router.push(sale?.eventId ? `/admin/events/${sale.eventId}` : '/admin/reports')}
          sx={{ mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Validar {event ? `- ${event.title}` : 'Venta'}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            {event ? (
              <CardMedia
                component="img"
                height="200"
                image={event.image?.url || '/placeholder-event.jpg'}
                alt={event.title}
              />
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
              {eventLoading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress size={24} />
                </Box>
              ) : event ? (
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
                      {formatDate(String(event.date))}
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
                    Puedes validar una entrada ingresando su ID.
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                </>
              )}

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Instrucciones:
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                1. Ingrese el ID del ticket o escanee el código QR
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                2. Presione &quot;Validar&quot; o Enter
              </Typography>
              <Typography variant="body2" color="text.secondary">
                3. Revise los resultados de la validación
              </Typography>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<QrCodeScannerIcon />}
                  onClick={() => setScannerOpen(true)}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Escanear Código QR
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => router.push(sale?.eventId ? `/admin/events/${sale.eventId}` : '/admin/reports')}
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
                              <IconButton onClick={() => handleCopyToClipboard()} size="small" edge="end" title="Copiar ID">
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </InputAdornment>
                          ) : undefined,
                        },
                      }}
                    />
                  </Grid>
                  <Grid>
                    <Button type="submit" variant="contained" disabled={!ticketId.trim() || submitting} sx={{ height: '56px' }}>
                      {submitting ? <CircularProgress size={24} /> : 'Validar'}
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
                  Haga clic aquí o presione el botón para abrir el escáner QR
                </Typography>
              </Paper>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Historial de Validaciones
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <EventIcon color="action" sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
                <Typography variant="body1" color="text.secondary">
                  El historial de validaciones aparecerá aquí
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  (Función en desarrollo)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Resultado de validación */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{sale?.validated ? 'Entrada Validada' : 'Resultado de Validación'}</DialogTitle>
        <DialogContent>
          {sale ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Detalles de la Entrada
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
                  <Typography variant="subtitle2">Tipo</Typography>
                  <Typography variant="body1" gutterBottom>
                    {sale.ticketType}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Comprador</Typography>
                  <Typography variant="body1" gutterBottom>
                    {`${sale.firstName} ${sale.lastName}`.trim() || sale.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Email</Typography>
                  <Typography variant="body1" gutterBottom>
                    {sale.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Precio</Typography>
                  <Typography variant="body1" gutterBottom>
                    ${sale.price.toFixed(2)}
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
          <Button onClick={handleCloseDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de escáner QR (mock) */}
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
              Vista previa del escáner QR
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Escanea el código QR de la entrada para validarla automáticamente.
          </Typography>
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

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar((p) => ({ ...p, open: false }))} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function SalesValidationPage() {
  return (
    <BackofficeLayout title="Validar Venta">
      <SalesValidationContent />
    </BackofficeLayout>
  );
}

export default SalesValidationPage;