'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Button,
  Paper,
  Divider,
  Alert,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  Container,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { CheckoutService } from '@/services/CheckoutService';
import { EventService } from '@/services/EventService';
import { EventDetail } from '@/types/event';
import { BuyerData, SessionInfoResponse } from '@/types/checkout';
import Link from 'next/link';

// List of countries for the nationality dropdown
const COUNTRIES = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba', 
  'Ecuador', 'El Salvador', 'Guatemala', 'Honduras', 'México', 'Nicaragua', 
  'Panamá', 'Paraguay', 'Perú', 'Puerto Rico', 'República Dominicana', 
  'Uruguay', 'Venezuela', 'España', 'Estados Unidos', 'Otro'
];

// Document types
const documentType = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PA', label: 'Pasaporte' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'NIT', label: 'NIT' },
  { value: 'OTRO', label: 'Otro' },
];

export default function CheckoutPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionInfoResponse | null>(null);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [buyers, setBuyers] = useState<BuyerData[]>([]);
  const [mainEmail, setMainEmail] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

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
          const initialBuyers = Array(sessionData.quantity).fill(0).map((_, index) => ({
            name: '',
            lastName: '',
            email: '',
            phone: '',
            nationality: 'Argentina',
            documentType: 'DNI',
            document: ''
          }));
          setBuyers(initialBuyers);
        }

        // Set main email if it exists
        if (sessionData.mainEmail) {
          setMainEmail(sessionData.mainEmail);
        }

        // Fetch event data
        const eventData = await EventService.getEventById(sessionData.eventId);
        setEvent(eventData);
      } catch (err) {
        console.error('Error:', err);
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
      
      // Save buyer data to session
      await CheckoutService.addSessionData(sessionId as string, {
        mainEmail,
        buyer: buyers
      });

      // Process payment (this would redirect to payment gateway in a real scenario)
      const result = await CheckoutService.processPayment(sessionId as string);
      
      if (result.success && result.redirectUrl) {
        router.push(result.redirectUrl);
      } else {
        throw new Error('Error al procesar el pago');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link} 
          href="/"
          startIcon={<ArrowBackIcon />}
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
        <Alert severity="warning">No se encontró la información del evento.</Alert>
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
  const selectedTicket = event.tickets.find(t => t.id === session.priceId);

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
                  {new Date(event.date).toLocaleDateString('es-AR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
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
                  ${selectedTicket ? (selectedTicket.value * session.quantity).toLocaleString('es-AR') : '0'} {selectedTicket?.currency}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle1">Total:</Typography>
              <Typography variant="h6" color="primary">
                ${selectedTicket ? (selectedTicket.value * session.quantity).toLocaleString('es-AR') : '0'} {selectedTicket?.currency}
              </Typography>
            </Box>
          </Paper>
          
          {/* Payment Methods */}
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Métodos de pago</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Aceptamos todas las tarjetas de crédito y débito a través de MercadoPago.
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
              <img 
                src="/images/payment-methods/visa.png" 
                alt="Visa" 
                style={{ height: 24, objectFit: 'contain' }} 
              />
              <img 
                src="/images/payment-methods/mastercard.png" 
                alt="Mastercard" 
                style={{ height: 24, objectFit: 'contain' }} 
              />
              <img 
                src="/images/payment-methods/amex.png" 
                alt="American Express" 
                style={{ height: 24, objectFit: 'contain' }} 
              />
              <img 
                src="/images/payment-methods/mercadopago.png" 
                alt="MercadoPago" 
                style={{ height: 24, objectFit: 'contain' }} 
              />
            </Box>
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
