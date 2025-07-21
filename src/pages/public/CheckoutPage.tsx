import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
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
  IconButton
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { CheckoutService, SessionInfoResponse, BuyerData } from '../../services/CheckoutService';
import { EventService } from '../../services/EventService';
import { EventDetail } from '../../types/Event';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const CheckoutPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionInfoResponse | null>(null);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [buyers, setBuyers] = useState<BuyerData[]>([]);
  const [mainEmail, setMainEmail] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessionAndEvent = async () => {
      if (!sessionId) return;

      try {
        setLoading(true);
        setError(null);
        
        // Fetch session data
        const sessionData = await CheckoutService.getSession(sessionId);
        setSession(sessionData);

        // Initialize buyers array based on quantity
        if (sessionData.quantity > 0) {
          const initialBuyers = Array(sessionData.quantity).fill(0).map(() => ({
            name: '',
            lastName: '',
            email: '',
            phone: '',
            nationality: 'Colombia',
            documentType: 'CC',
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

  const handleBuyerChange = (index: number, field: keyof BuyerData, value: string) => {
    const updatedBuyers = [...buyers];
    updatedBuyers[index] = {
      ...updatedBuyers[index],
      [field]: value
    };
    setBuyers(updatedBuyers);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!mainEmail) {
      errors.mainEmail = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(mainEmail)) {
      errors.mainEmail = 'Ingrese un correo electrónico válido';
    }

    buyers.forEach((buyer, index) => {
      if (!buyer.name) errors[`buyer-${index}-name`] = 'El nombre es requerido';
      if (!buyer.lastName) errors[`buyer-${index}-lastName`] = 'El apellido es requerido';
      if (!buyer.email) {
        errors[`buyer-${index}-email`] = 'El correo es requerido';
      } else if (!/\S+@\S+\.\S+/.test(buyer.email)) {
        errors[`buyer-${index}-email`] = 'Ingrese un correo válido';
      }
      if (!buyer.phone) errors[`buyer-${index}-phone`] = 'El teléfono es requerido';
      if (!buyer.document) errors[`buyer-${index}-document`] = 'El documento es requerido';
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !sessionId) return;

    try {
      setIsSubmitting(true);
      await CheckoutService.addSessionData(sessionId, {
        mainEmail,
        buyer: buyers
      });
      
      // Navigate to payment page or next step
      // navigate(`/payment/${sessionId}`);
      
    } catch (error) {
      console.error('Error saving buyer information:', error);
      setError('Ocurrió un error al guardar la información. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
        >
          Volver al evento
        </Button>
      </Box>
    );
  }

  if (!event || !session) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
        <Alert severity="warning">No se encontró la información solicitada.</Alert>
      </Box>
    );
  }

  // Find the selected ticket
  const selectedTicket = event.tickets.find(t => t.id === session.priceId);

  const renderBuyerForm = (buyer: BuyerData, index: number) => (
    <Card key={index} sx={{ mb: 3, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Datos del asistente {index + 1}
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nombre"
            value={buyer.name}
            onChange={(e) => handleBuyerChange(index, 'name', e.target.value)}
            error={!!formErrors[`buyer-${index}-name`]}
            helperText={formErrors[`buyer-${index}-name`]}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Apellido"
            value={buyer.lastName}
            onChange={(e) => handleBuyerChange(index, 'lastName', e.target.value)}
            error={!!formErrors[`buyer-${index}-lastName`]}
            helperText={formErrors[`buyer-${index}-lastName`]}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Correo electrónico"
            type="email"
            value={buyer.email}
            onChange={(e) => handleBuyerChange(index, 'email', e.target.value)}
            error={!!formErrors[`buyer-${index}-email`]}
            helperText={formErrors[`buyer-${index}-email`]}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Teléfono"
            value={buyer.phone}
            onChange={(e) => handleBuyerChange(index, 'phone', e.target.value)}
            error={!!formErrors[`buyer-${index}-phone`]}
            helperText={formErrors[`buyer-${index}-phone`]}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth margin="normal" error={!!formErrors[`buyer-${index}-documentType`]}>
            <InputLabel>Tipo de documento</InputLabel>
            <Select
              value={buyer.documentType}
              label="Tipo de documento"
              onChange={(e) => handleBuyerChange(index, 'documentType', e.target.value)}
            >
              <MenuItem value="CC">Cédula de ciudadanía</MenuItem>
              <MenuItem value="CE">Cédula de extranjería</MenuItem>
              <MenuItem value="PASSPORT">Pasaporte</MenuItem>
              <MenuItem value="NIT">NIT</MenuItem>
            </Select>
            {formErrors[`buyer-${index}-documentType`] && (
              <FormHelperText>{formErrors[`buyer-${index}-documentType`]}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Número de documento"
            value={buyer.document}
            onChange={(e) => handleBuyerChange(index, 'document', e.target.value)}
            error={!!formErrors[`buyer-${index}-document`]}
            helperText={formErrors[`buyer-${index}-document`]}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Nacionalidad</InputLabel>
            <Select
              value={buyer.nationality}
              label="Nacionalidad"
              onChange={(e) => handleBuyerChange(index, 'nationality', e.target.value)}
            >
              <MenuItem value="Colombia">Colombia</MenuItem>
              <MenuItem value="Argentina">Argentina</MenuItem>
              <MenuItem value="Brasil">Brasil</MenuItem>
              <MenuItem value="Chile">Chile</MenuItem>
              <MenuItem value="Ecuador">Ecuador</MenuItem>
              <MenuItem value="México">México</MenuItem>
              <MenuItem value="Perú">Perú</MenuItem>
              <MenuItem value="Venezuela">Venezuela</MenuItem>
              <MenuItem value="Otro">Otro</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Card>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Button 
        variant="outlined" 
        startIcon={<ArrowBackIcon />} 
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Volver
      </Button>

      <Typography variant="h4" component="h1" gutterBottom>
        Finalizar compra
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Completa la información de los asistentes
      </Typography>

      <Grid container spacing={3}>
        {/* Left Column - Buyer Information Form */}
        <Grid item xs={12} md={7}>
          <form onSubmit={handleSubmit}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Información de contacto principal
                </Typography>
                
                <TextField
                  fullWidth
                  label="Correo electrónico para la confirmación"
                  type="email"
                  value={mainEmail}
                  onChange={(e) => setMainEmail(e.target.value)}
                  error={!!formErrors.mainEmail}
                  helperText={formErrors.mainEmail}
                  margin="normal"
                />
              </CardContent>
            </Card>

            {buyers.map((buyer, index) => renderBuyerForm(buyer, index))}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={isSubmitting}
              sx={{ mt: 2 }}
            >
              {isSubmitting ? 'Procesando...' : 'Continuar con el pago'}
            </Button>
          </form>
        </Grid>

        {/* Right Column - Order Summary */}
        <Grid item xs={12} md={5}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumen de la compra
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                {event.title}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Fecha y hora
                </Typography>
                <Typography variant="body1">
                  {new Date(event.date).toLocaleString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Ubicación
                </Typography>
                <Typography variant="body1">
                  {event.location.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.location.address}, {event.location.city}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>
                Detalles de la compra
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                {selectedTicket ? (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">
                        {selectedTicket.type} x {session.quantity}
                      </Typography>
                      <Typography variant="body1">
                        {selectedTicket.currency} {(selectedTicket.value * session.quantity).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.12)' }}>
                      <Typography variant="subtitle1">
                        Total
                      </Typography>
                      <Typography variant="h6">
                        {selectedTicket.currency} {(selectedTicket.value * session.quantity).toLocaleString()}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Typography color="error">
                    No se encontró la información del tipo de entrada seleccionado.
                  </Typography>
                )}
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CheckoutPage;
