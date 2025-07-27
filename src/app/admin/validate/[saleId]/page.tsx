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
  CardHeader, 
  CardMedia, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText,
  DialogActions,
  Grid,
  Paper,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery,
  IconButton,
  Avatar,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  QrCodeScanner as QrCodeScannerIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ArrowBack as ArrowBackIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { ValidatorService } from '@/services/ValidatorService';
import { EventService } from '@/services/EventService';
import { SalesService } from '@/services/SalesService';
import { EventDetail } from '@/types/Event';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AuthService } from '@/services/AuthService';

type Sale = {
  id: string;
  ticketType: string;
  firstName: string;
  lastName: string;
  email: string;
  price: number;
  validated: boolean;
  validatedAt?: string;
};

const EventTicketValidationPage = () => {
  const { id: eventId, saleId } = useParams<{ id: string; saleId?: string }>();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [ticketId, setTicketId] = useState('');
  const [sale, setSale] = useState<Sale | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  // Check authentication and redirect if needed
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    
    if (!AuthService.isAdmin()) {
      router.push('/');
      return;
    }
  }, [router]);
  
  // Auto-validate ticket if saleId is provided in URL
  useEffect(() => {
    if (eventId && saleId && !sale) {
      const validateTicket = async () => {
        try {
          setIsLoading(true);
          const salesService = SalesService.getInstance();
          await ValidatorService.validateTicket(eventId, saleId);
          // Fetch sale details after validation
          const saleData = await salesService.getSaleById(eventId, saleId);
          setSale(saleData);
          setOpenDialog(true);
        } catch (error) {
          console.error('Error validating ticket:', error);
          setSnackbar({
            open: true,
            message: 'Error al validar el ticket',
            severity: 'error'
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      validateTicket();
    }
  }, [eventId, saleId, sale]);

  // Check authentication and fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      
      try {
        setEventLoading(true);
        const eventData = await EventService.getEventById(eventId as string);
        setEvent(eventData);
      } catch (error) {
        console.error('Error fetching event:', error);
        setSnackbar({
          open: true,
          message: 'Error al cargar los datos del evento',
          severity: 'error'
        });
      } finally {
        setEventLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, router]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTicketId('');
  };

  const handleValidateTicket = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const idToValidate = ticketId.trim();
    if (!idToValidate || !eventId) return;
    
    try {
      setIsLoading(true);
      const salesService = SalesService.getInstance();
      await ValidatorService.validateTicket(eventId, idToValidate);
      
      // Fetch sale details after successful validation
      const saleData = await salesService.getSaleById(eventId, idToValidate);
      setSale(saleData);
      setOpenDialog(true);
      
      setSnackbar({
        open: true,
        message: 'Entrada validada correctamente',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error validating ticket:', error);
      setSnackbar({
        open: true,
        message: 'Error al validar el ticket. Verifique el ID e intente nuevamente.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanSuccess = (scannedTicketId: string) => {
    setTicketId(scannedTicketId);
    setScannerOpen(false);
    handleValidateTicket();
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(ticketId);
    setSnackbar({
      open: true,
      message: 'ID copiado al portapapeles',
      severity: 'info'
    });
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "EEEE d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
  };

  if (eventLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!event) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Evento no encontrado
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => router.push('/admin/events')}
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Volver a la lista de eventos
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => router.push(`/admin/events/${eventId}`)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Validar Entradas - {event.title}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardMedia
              component="img"
              height="200"
              image={event.image?.url || '/placeholder-event.jpg'}
              alt={event.title}
            />
            <CardContent>
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
                  {formatDate(event.date.toString())}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Instrucciones:
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                1. Ingrese el ID del ticket o escanee el código QR
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                2. Presione "Validar" o presione Enter
              </Typography>
              <Typography variant="body2" color="text.secondary">
                3. Revise los resultados de la validación
              </Typography>
            </CardContent>
          </Card>
          
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
              onClick={() => router.push(`/admin/events/${eventId}`)}
              fullWidth
            >
              Volver al Detalle del Evento
            </Button>
          </Box>
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
                      label="ID del Ticket"
                      value={ticketId}
                      onChange={(e) => setTicketId(e.target.value)}
                      placeholder="Ingrese el ID del ticket o escanee el código QR"
                      InputProps={{
                        endAdornment: ticketId && (
                          <IconButton 
                            onClick={handleCopyToClipboard}
                            size="small"
                            edge="end"
                            title="Copiar ID"
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={!ticketId.trim() || isLoading}
                      sx={{ height: '56px' }}
                    >
                      {isLoading ? <CircularProgress size={24} /> : 'Validar'}
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
                  '&:hover': {
                    backgroundColor: 'action.selected',
                  },
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

      {/* Validation Result Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {sale?.validated ? 'Entrada Validada' : 'Confirmar Validación'}
        </DialogTitle>
        <DialogContent>
          {sale ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Detalles de la Entrada
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2">ID de la Entrada</Typography>
                  <Typography variant="body1" gutterBottom>{sale.id}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Tipo</Typography>
                  <Typography variant="body1" gutterBottom>{sale.ticketType}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Comprador</Typography>
                  <Typography variant="body1" gutterBottom>{`${sale.firstName} ${sale.lastName}`}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Email</Typography>
                  <Typography variant="body1" gutterBottom>{sale.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Precio</Typography>
                  <Typography variant="body1" gutterBottom>${sale.price.toFixed(2)}</Typography>
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
                    <Typography variant="body2" color="textSecondary">
                      {new Date(sale.validatedAt).toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          ) : (
            <Typography>¿Está seguro que desea validar esta entrada?</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cerrar
          </Button>
          {!sale?.validated && (
            <Button
              onClick={handleValidateTicket}
              color="primary"
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Validando...' : 'Validar Entrada'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* QR Scanner Dialog */}
      <Dialog
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        maxWidth="sm"
        fullWidth
      >
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
              position: 'relative'
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
                zIndex: 1
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
          <Button 
            onClick={() => handleScanSuccess('mock-scanned-ticket-id')} 
            color="primary" 
            variant="contained"
          >
            Simular Escaneo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EventTicketValidationPage;
