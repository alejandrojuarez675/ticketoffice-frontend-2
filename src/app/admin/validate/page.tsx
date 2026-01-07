// src/app/admin/validate/page.tsx
'use client';

import React, { Suspense, useEffect, useState, useCallback, useRef } from 'react';
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
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Snackbar,
  TextField,
  Typography,
  Zoom,
  Fade,
} from '@mui/material';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ContentCopy as ContentCopyIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  QrCodeScanner as QrCodeScannerIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  ConfirmationNumber as TicketIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import Loading from '@/components/common/Loading';
import QRScanner from '@/components/common/QRScanner';
import { AuthService } from '@/services/AuthService';
import { EventService } from '@/services/EventService';
import type { EventDetail } from '@/types/Event';
import { SalesService } from '@/services/SalesService';
import { ConfigService } from '@/services/ConfigService';
import { sanitizeString } from '@/utils/sanitize';

export const dynamic = 'force-dynamic';

type ValidationResult = {
  id: string;
  success: boolean;
  message: string;
  ticketType?: string;
  buyerName?: string;
  buyerEmail?: string;
  price?: number;
  validatedAt: string;
  alreadyValidated?: boolean;
  eventName?: string;
  eventDate?: string;
  eventLocation?: string;
};

type ValidationHistoryItem = {
  id: string;
  success: boolean;
  buyerName?: string;
  ticketType?: string;
  timestamp: string;
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
  const preSaleId = search.get('saleId') || search.get('sale-id') || undefined;

  const router = useRouter();

  const [ticketId, setTicketId] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [eventLoading, setEventLoading] = useState<boolean>(!!eventId);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [validationHistory, setValidationHistory] = useState<ValidationHistoryItem[]>([]);
  const [validatedCount, setValidatedCount] = useState(0);
  
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Ref para sonidos
  const successSoundRef = useRef<HTMLAudioElement | null>(null);
  const errorSoundRef = useRef<HTMLAudioElement | null>(null);

  // Inicializar sonidos
  useEffect(() => {
    // Crear sonidos de feedback (usando Web Audio API o data URIs simples)
    successSoundRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp6djnh2cIuQjoF1cXZ+ho+WlY+IfHl6f4WIi4qHgn5+gIWIiYmHhIGAgYOFhoaFhIOCgoKDhISEg4OCgoKCg4ODg4KCgoKCgoKCgoKCgoKCgoKCgoKC');
    errorSoundRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAABxdXdzdHZ4enx+gIOFh4mLjY6Pj4+Ojo2LiYeFgn98enh2dHNycHBwcHFydHZ4en2Ag4aJjI+RkpKRj42KhoJ+enZycG5tbW1ub3Fyc3V3');
  }, []);

  // Función para reproducir sonido
  const playSound = useCallback((success: boolean) => {
    try {
      const sound = success ? successSoundRef.current : errorSoundRef.current;
      if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {});
      }
    } catch {
      // Ignorar errores de audio
    }
  }, []);

  // Función para vibrar
  const vibrate = useCallback((pattern: number | number[]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.replace(`/auth/login?next=${encodeURIComponent('/admin/validate' + (eventId ? `?eventId=${eventId}` : ''))}`);
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
    handleValidateWithId(preSaleId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preSaleId]);

  const addToHistory = useCallback((result: ValidationResult) => {
    const historyItem: ValidationHistoryItem = {
      id: result.id,
      success: result.success,
      buyerName: result.buyerName,
      ticketType: result.ticketType,
      timestamp: result.validatedAt,
    };
    setValidationHistory(prev => [historyItem, ...prev].slice(0, 10)); // Mantener últimas 10
    if (result.success) {
      setValidatedCount(prev => prev + 1);
    }
  }, []);

  const handleValidateWithId = async (idToValidate: string) => {
    // Sanitizar el ID antes de validar
    const sanitizedId = sanitizeString(idToValidate).trim();
    if (!sanitizedId) return;

    try {
      setIsSubmitting(true);
      setValidationResult(null);

      if (ConfigService.isMockedEnabled()) {
        // MOCK: Simular validación exitosa con datos del comprador y evento
        await new Promise(resolve => setTimeout(resolve, 500)); // Simular latencia
        
        const mockResult: ValidationResult = {
          id: sanitizedId,
          success: true,
          message: 'Entrada validada correctamente',
          ticketType: 'VIP',
          buyerName: 'Juan Pérez',
          buyerEmail: 'juan.perez@email.com',
          price: 5000,
          validatedAt: new Date().toISOString(),
          eventName: event?.title || 'Concierto de Rock 2024',
          eventDate: event?.date || new Date().toISOString(),
          eventLocation: event?.location?.city || 'Buenos Aires',
        };

        setValidationResult(mockResult);
        addToHistory(mockResult);
        setOpenDialog(true);
        playSound(true);
        vibrate(200);
        setSnackbar({ open: true, message: '✅ Entrada validada correctamente', severity: 'success' });
        return;
      }

      // Llamada real al backend
      await SalesService.validate(sanitizedId);
      
      const result: ValidationResult = {
        id: sanitizedId,
        success: true,
        message: 'Entrada validada correctamente',
        validatedAt: new Date().toISOString(),
        eventName: event?.title || 'Evento no especificado',
        eventDate: event?.date,
        eventLocation: event?.location?.city,
      };

      setValidationResult(result);
      addToHistory(result);
      setOpenDialog(true);
      playSound(true);
      vibrate(200);
      setSnackbar({ open: true, message: '✅ Entrada validada correctamente', severity: 'success' });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      const isAlreadyValidated = errorMessage.toLowerCase().includes('already') || errorMessage.toLowerCase().includes('ya validada');
      
      const result: ValidationResult = {
        id: sanitizedId,
        success: false,
        message: isAlreadyValidated ? 'Esta entrada ya fue validada anteriormente' : 'Error al validar la entrada',
        validatedAt: new Date().toISOString(),
        alreadyValidated: isAlreadyValidated,
      };

      setValidationResult(result);
      addToHistory(result);
      setOpenDialog(true);
      playSound(false);
      vibrate([100, 50, 100]); // Patrón de vibración de error
      setSnackbar({ 
        open: true, 
        message: isAlreadyValidated ? '⚠️ Entrada ya validada' : '❌ Error al validar', 
        severity: isAlreadyValidated ? 'warning' : 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidateTicket = async (e?: React.FormEvent) => {
    e?.preventDefault();
    await handleValidateWithId(ticketId.trim());
  };

  const handleScanSuccess = async (scannedSaleId: string) => {
    setTicketId(scannedSaleId);
    setScannerOpen(false);
    await handleValidateWithId(scannedSaleId);
  };

  const handleScanAnother = () => {
    setOpenDialog(false);
    setTicketId('');
    setValidationResult(null);
    setScannerOpen(true);
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
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <IconButton onClick={() => router.push(eventId ? `/admin/events/${eventId}` : '/admin/events')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Validar Entradas{event ? ` - ${event.title}` : ''}
        </Typography>
        {validatedCount > 0 && (
          <Chip 
            icon={<CheckCircleIcon />} 
            label={`${validatedCount} validadas`} 
            color="success" 
            variant="outlined"
          />
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Panel izquierdo - Info del evento */}
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
                    Validación General
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Escanea el QR de cualquier entrada para validarla.
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                </>
              )}

              {/* Historial de validaciones */}
              {validationHistory.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <HistoryIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Últimas validaciones
                    </Typography>
                  </Box>
                  <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {validationHistory.slice(0, 5).map((item, index) => (
                      <ListItem key={`${item.id}-${index}`} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {item.success ? (
                            <CheckCircleIcon color="success" fontSize="small" />
                          ) : (
                            <CancelIcon color="error" fontSize="small" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.buyerName || `ID: ${item.id.slice(0, 8)}...`}
                          secondary={new Date(item.timestamp).toLocaleTimeString()}
                          primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Panel derecho - Validación */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Validar Entrada Manualmente
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box component="form" onSubmit={handleValidateTicket} sx={{ mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, md: 9 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="ID de la Venta"
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
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      disabled={!ticketId.trim() || isSubmitting} 
                      fullWidth
                      sx={{ height: '56px' }}
                    >
                      {isSubmitting ? <CircularProgress size={24} /> : 'Validar'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {/* Área de escaneo visual */}
              <Paper
                variant="outlined"
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    backgroundColor: 'primary.light',
                    borderColor: 'primary.dark',
                    transform: 'scale(1.01)',
                  },
                }}
                onClick={() => setScannerOpen(true)}
              >
                <QrCodeScannerIcon color="primary" sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Toca aquí para escanear
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Se abrirá la cámara para leer el código QR de la entrada
                </Typography>
              </Paper>

              {/* Instrucciones */}
              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  El código QR contiene una URL que el sistema identifica automáticamente al escanear y valida la entrada.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de resultado de validación - MEJORADO */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        TransitionComponent={Zoom}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          {validationResult && (
            <Fade in timeout={500}>
              <Box>
                {/* Icono grande animado */}
                <Box 
                  sx={{ 
                    mb: 3,
                    animation: validationResult.success ? 'pulse 0.5s ease-in-out' : 'shake 0.5s ease-in-out',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(0)' },
                      '50%': { transform: 'scale(1.2)' },
                      '100%': { transform: 'scale(1)' },
                    },
                    '@keyframes shake': {
                      '0%, 100%': { transform: 'translateX(0)' },
                      '25%': { transform: 'translateX(-10px)' },
                      '75%': { transform: 'translateX(10px)' },
                    },
                  }}
                >
                  {validationResult.success ? (
                    <CheckCircleIcon sx={{ fontSize: 100, color: 'success.main' }} />
                  ) : validationResult.alreadyValidated ? (
                    <WarningIcon sx={{ fontSize: 100, color: 'warning.main' }} />
                  ) : (
                    <CancelIcon sx={{ fontSize: 100, color: 'error.main' }} />
                  )}
                </Box>

                {/* Mensaje principal */}
                <Typography 
                  variant="h4" 
                  gutterBottom 
                  color={validationResult.success ? 'success.main' : validationResult.alreadyValidated ? 'warning.main' : 'error.main'}
                  fontWeight="bold"
                >
                  {validationResult.success ? '¡VÁLIDA!' : validationResult.alreadyValidated ? 'YA VALIDADA' : 'ERROR'}
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {validationResult.message}
                </Typography>

                <Divider sx={{ my: 3 }} />

                {/* Información del evento y comprador */}
                <Box sx={{ textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
                  {validationResult.eventName && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EventIcon color="primary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Evento</Typography>
                        <Typography variant="body1" fontWeight="bold">{validationResult.eventName}</Typography>
                        {validationResult.eventLocation && (
                          <Typography variant="caption" color="text.secondary">
                            {validationResult.eventLocation}
                            {validationResult.eventDate && ` • ${new Date(validationResult.eventDate).toLocaleDateString('es-AR')}`}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}

                  {validationResult.buyerName && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PersonIcon color="action" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Comprador</Typography>
                        <Typography variant="body1" fontWeight="medium">{validationResult.buyerName}</Typography>
                      </Box>
                    </Box>
                  )}

                  {validationResult.buyerEmail && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EmailIcon color="action" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Email</Typography>
                        <Typography variant="body2">{validationResult.buyerEmail}</Typography>
                      </Box>
                    </Box>
                  )}

                  {validationResult.ticketType && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TicketIcon color="action" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Tipo de entrada</Typography>
                        <Chip label={validationResult.ticketType} size="small" color="primary" />
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon color="action" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Hora de validación</Typography>
                      <Typography variant="body2">
                        {new Date(validationResult.validatedAt).toLocaleString('es-AR')}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Fade>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={handleScanAnother}
            startIcon={<RefreshIcon />}
            size="large"
          >
            Escanear Siguiente
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => setOpenDialog(false)}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Scanner real con cámara */}
      {scannerOpen && (
        <QRScanner
          onScan={handleScanSuccess}
          onClose={() => setScannerOpen(false)}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', fontSize: '1rem' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
