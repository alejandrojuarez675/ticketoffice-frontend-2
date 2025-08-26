'use client';

import React, { useEffect, useState } from 'react';
import LightLayout from '@/components/layouts/LightLayout';
import { useParams, useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Button,
  Paper,
  Divider,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Container,
  CardMedia
} from '@mui/material';
import { Alert, Chip, Stack } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { CheckoutService } from '@/services/CheckoutService';
import { MercadoPagoApi } from '@/services/MercadoPagoApi';
import { EventService } from '@/services/EventService';
import type { EventDetail } from '@/types/Event';
import type { BuyerData, SessionInfoResponse } from '@/types/checkout';
import Link from 'next/link';
import { formatCurrency, formatEventDate } from '@/utils/format';
import { logger } from '@/lib/logger';
import Loading from '@/components/common/Loading';
import ErrorState from '@/components/common/ErrorState';
import Empty from '@/components/common/Empty';
import { useSearchParams } from 'next/navigation';

// List of countries for the nationality dropdown
const COUNTRIES = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba', 
  'Ecuador', 'El Salvador', 'Guatemala', 'Honduras', 'México', 'Nicaragua', 
  'Panamá', 'Paraguay', 'Perú', 'Puerto Rico', 'República Dominicana', 
  'Uruguay', 'Venezuela', 'España', 'Estados Unidos', 'Otro'
];

// (unused) document types list removed

function CheckoutContent() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = (searchParams?.get('status') || '').toLowerCase();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionInfoResponse | null>(null);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [buyers, setBuyers] = useState<BuyerData[]>([]);
  const [mainEmail, setMainEmail] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch session and event data on component mount
  useEffect(() => {
    const fetchSessionAndEvent = async () => {
      if (!sessionId) return;

      try {
        setLoading(true);
        setError(null);
        
        // Fetch session data
        const sessionData = await CheckoutService.getSession(sessionId as string);
        setSession(sessionData);

        // Initialize buyers array based on quantity
        if (sessionData.quantity > 0) {
          const initialBuyers = Array(sessionData.quantity).fill(0).map(() => ({
            name: '',
            lastName: '',
            email: '',
            phone: '',
            nationality: 'Argentina',
            documentType: 'DNI',
            document: ''
          }));
          // Try to restore persisted data for this session
          try {
            const key = `checkout:${sessionData.sessionId}`;
            const persisted = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
            if (persisted) {
              const parsed = JSON.parse(persisted) as { mainEmail?: string; buyers?: BuyerData[]; couponCode?: string };
              if (parsed.mainEmail) setMainEmail(parsed.mainEmail);
              if (parsed.couponCode) setCouponCode(parsed.couponCode);
              if (Array.isArray(parsed.buyers) && parsed.buyers.length) {
                // Ensure length matches quantity
                const adjusted = [...parsed.buyers].slice(0, sessionData.quantity);
                while (adjusted.length < sessionData.quantity) adjusted.push({ ...initialBuyers[0] });
                setBuyers(adjusted);
              } else {
                setBuyers(initialBuyers);
              }
              logger.info('checkout_open_restored', { sessionId: sessionData.sessionId });
            } else {
              setBuyers(initialBuyers);
              logger.info('checkout_open_new', { sessionId: sessionData.sessionId });
            }
          } catch (e) {
            setBuyers(initialBuyers);
            logger.warn('checkout_restore_failed', e);
          }
        }

        // Set main email if it exists
        if (sessionData.mainEmail) {
          setMainEmail(sessionData.mainEmail);
        }

        // Fetch event data
        const eventData = await EventService.getEventById(sessionData.eventId);
        setEvent(eventData);
      } catch (err) {
        logger.error('checkout_load_failed', err);
        setError('La sesión no existe o ha expirado. Por favor, inicia el proceso de compra nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndEvent();
  }, [sessionId]);

  // Handle input changes for buyer information
  const handleBuyerChange = (index: number, field: keyof BuyerData, value: string) => {
    const updatedBuyers = [...buyers];
    updatedBuyers[index] = {
      ...updatedBuyers[index],
      [field]: value
    };
    setBuyers(updatedBuyers);
  };

  // Persist to localStorage when relevant state changes
  useEffect(() => {
    if (!session?.sessionId) return;
    try {
      const key = `checkout:${session.sessionId}`;
      const payload = { mainEmail, buyers, couponCode };
      localStorage.setItem(key, JSON.stringify(payload));
    } catch {
      // ignore quota/serialisation errors
    }
  }, [session?.sessionId, mainEmail, buyers, couponCode]);

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!mainEmail) {
      errors.mainEmail = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(mainEmail)) {
      errors.mainEmail = 'Ingrese un correo electrónico válido';
    }

    buyers.forEach((buyer, index) => {
      if (!buyer.name) {
        errors[`buyer-${index}-name`] = 'El nombre es requerido';
      }
      if (!buyer.lastName) {
        errors[`buyer-${index}-lastName`] = 'El apellido es requerido';
      }
      if (!buyer.email) {
        errors[`buyer-${index}-email`] = 'El correo electrónico es requerido';
      } else if (!/\S+@\S+\.\S+/.test(buyer.email)) {
        errors[`buyer-${index}-email`] = 'Ingrese un correo electrónico válido';
      }
      if (!buyer.phone) {
        errors[`buyer-${index}-phone`] = 'El teléfono es requerido';
      }
      if (!buyer.document) {
        errors[`buyer-${index}-document`] = 'El documento es requerido';
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!sessionId) {
      setError('Sesión no válida');
      return;
    }

    try {
      setIsSubmitting(true);
      logger.info('checkout_submit', { sessionId });
      
      // Save buyer data to session
      await CheckoutService.addSessionData(sessionId as string, {
        mainEmail,
        buyer: buyers,
        couponCode: couponCode?.trim() || undefined,
      });

      // Process payment via MercadoPago and redirect
      const redirectUrl = await MercadoPagoApi.createCheckoutRedirect(sessionId as string);
      logger.info('checkout_payment_redirect', { sessionId, redirectUrl });
      router.push(redirectUrl);
    } catch (error) {
      logger.error('checkout_submit_failed', error);
      setError('Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Loading label="Cargando checkout..." minHeight="60vh" />
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ErrorState message={error} onRetry={() => location.reload()} />
        <Button 
          variant="contained" 
          color="primary" 
          component={Link} 
          href="/"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Volver al inicio
        </Button>
      </Container>
    );
  }

  // Render not found state
  if (!session || !event) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Empty title="No se encontró la información del evento" description="Vuelve al inicio e intenta nuevamente." />
        <Button 
          variant="contained" 
          color="primary" 
          component={Link} 
          href="/"
          sx={{ mt: 2 }}
          startIcon={<ArrowBackIcon />}
        >
          Volver al inicio
        </Button>
      </Container>
    );
  }

  // Find the selected ticket
  const selectedTicket = event.tickets.find((t) => t.id === session.priceId);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button 
        variant="text" 
        color="primary" 
        component={Link} 
        href={`/events/${event.id}`}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Volver al evento
      </Button>

      <Typography variant="h4" component="h1" gutterBottom>
        Finalizar compra
      </Typography>

      {/* Status banner if user returned from provider */}
      {status === 'failure' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          El pago fue rechazado o cancelado. Intenta nuevamente o usa otro medio de pago.
        </Alert>
      )}
      {status === 'pending' && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Tu pago está pendiente de confirmación. Te notificaremos por email cuando se acredite.
        </Alert>
      )}
      
      <Grid container spacing={4}>
        {/* Event Summary */}
        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>Resumen del pedido</Typography>
            
            <Box display="flex" alignItems="center" mb={2}>
              <Box width={80} height={60} position="relative" mr={2}>
                <CardMedia
                  component="img"
                  image={event.image.url}
                  alt={event.title}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1 }}
                />
              </Box>
              <Box>
                <Typography variant="subtitle1">{event.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {(() => { const { dateStr, timeStr } = formatEventDate(event.date, 'es-AR'); return `${dateStr} ${timeStr}`; })()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.location.name}, {event.location.city}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">Tipo de entrada</Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography>
                  {selectedTicket?.type} x {session.quantity}
                </Typography>
                <Typography>
                  {selectedTicket ? formatCurrency(selectedTicket.value * session.quantity, selectedTicket.currency, 'es-AR') : formatCurrency(0, 'ARS', 'es-AR')}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle1">Total:</Typography>
              <Typography variant="h6" color="primary">
                {selectedTicket ? formatCurrency(selectedTicket.value * session.quantity, selectedTicket.currency, 'es-AR') : formatCurrency(0, 'ARS', 'es-AR')}
              </Typography>
            </Box>
          </Paper>
          
          {/* Payment Methods */}
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Métodos de pago</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Aceptamos todas las tarjetas de crédito y débito a través de MercadoPago.
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" mt={2}>
              <Chip label="Visa" variant="outlined" size="small" />
              <Chip label="Mastercard" variant="outlined" size="small" />
              <Chip label="American Express" variant="outlined" size="small" />
              <Chip label="MercadoPago" color="primary" variant="outlined" size="small" />
            </Stack>
          </Paper>
        </Grid>
        
        {/* Checkout Form */}
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <Paper component="form" onSubmit={handleSubmit} elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>Información de contacto</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Te enviaremos los detalles de tu compra a este correo electrónico.
            </Typography>
            
            <TextField
              fullWidth
              label="Correo electrónico"
              variant="outlined"
              margin="normal"
              type="email"
              value={mainEmail}
              onChange={(e) => setMainEmail(e.target.value)}
              error={!!formErrors.mainEmail}
              helperText={formErrors.mainEmail}
              required
            />

            <TextField
              fullWidth
              label="Cupón de descuento (opcional)"
              variant="outlined"
              margin="normal"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              onBlur={() => logger.info('checkout_coupon_blur', { sessionId, couponCode: couponCode?.trim() || '' })}
              placeholder="Ingresa tu código"
            />
            
            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Información de los asistentes</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Por favor, completa la información de cada asistente. Asegúrate de que los nombres coincidan con los documentos de identidad.
            </Typography>
            
            {buyers.map((buyer, index) => (
              <Box key={index} sx={{ mb: 4, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>Asistente {index + 1}</Typography>
                
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Nombre"
                      variant="outlined"
                      margin="normal"
                      value={buyer.name}
                      onChange={(e) => handleBuyerChange(index, 'name', e.target.value)}
                      error={!!formErrors[`buyer-${index}-name`]}
                      helperText={formErrors[`buyer-${index}-name`]}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Apellido"
                      variant="outlined"
                      margin="normal"
                      value={buyer.lastName}
                      onChange={(e) => handleBuyerChange(index, 'lastName', e.target.value)}
                      error={!!formErrors[`buyer-${index}-lastName`]}
                      helperText={formErrors[`buyer-${index}-lastName`]}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Correo electrónico"
                      variant="outlined"
                      margin="normal"
                      type="email"
                      value={buyer.email}
                      onChange={(e) => handleBuyerChange(index, 'email', e.target.value)}
                      error={!!formErrors[`buyer-${index}-email`]}
                      helperText={formErrors[`buyer-${index}-email`]}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Teléfono"
                      variant="outlined"
                      margin="normal"
                      type="tel"
                      value={buyer.phone}
                      onChange={(e) => handleBuyerChange(index, 'phone', e.target.value)}
                      error={!!formErrors[`buyer-${index}-phone`]}
                      helperText={formErrors[`buyer-${index}-phone`]}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth margin="normal" error={!!formErrors[`buyer-${index}-documentType`]}>
                      <InputLabel id={`document-type-${index}-label`}>Tipo de documento</InputLabel>
                      <Select
                        labelId={`document-type-${index}-label`}
                        value={buyer.documentType}
                        label="Tipo de documento"
                        onChange={(e) => handleBuyerChange(index, 'documentType', e.target.value)}
                        required
                      >
                        <MenuItem value="DNI">DNI</MenuItem>
                        <MenuItem value="PASSPORT">Pasaporte</MenuItem>
                        <MenuItem value="CE">Carné de extranjería</MenuItem>
                        <MenuItem value="OTHER">Otro</MenuItem>
                      </Select>
                      {formErrors[`buyer-${index}-documentType`] && (
                        <FormHelperText>{formErrors[`buyer-${index}-documentType`]}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Número de documento"
                      variant="outlined"
                      margin="normal"
                      value={buyer.document}
                      onChange={(e) => handleBuyerChange(index, 'document', e.target.value)}
                      error={!!formErrors[`buyer-${index}-document`]}
                      helperText={formErrors[`buyer-${index}-document`]}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormControl fullWidth margin="normal" error={!!formErrors[`buyer-${index}-nationality`]}>
                      <InputLabel id={`nationality-${index}-label`}>Nacionalidad</InputLabel>
                      <Select
                        labelId={`nationality-${index}-label`}
                        value={buyer.nationality}
                        label="Nacionalidad"
                        onChange={(e) => handleBuyerChange(index, 'nationality', e.target.value)}
                        required
                      >
                        {COUNTRIES.map((country) => (
                          <MenuItem key={country} value={country}>
                            {country}
                          </MenuItem>
                        ))}
                      </Select>
                      {formErrors[`buyer-${index}-nationality`] && (
                        <FormHelperText>{formErrors[`buyer-${index}-nationality`]}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            ))}
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={isSubmitting}
                sx={{ minWidth: 200 }}
              >
                {isSubmitting ? 'Procesando...' : 'Pagar ahora'}
              </Button>
            </Box>
            
            <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary', fontSize: '0.75rem' }}>
              Al completar esta compra, aceptas nuestros Términos y Condiciones y la Política de Privacidad.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default function CheckoutPage() {
  return (
    <LightLayout title="Finalizar Compra - TicketOffice">
      <CheckoutContent />
    </LightLayout>
  );
}
