import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Button,
  TextFieldProps, 
  Card, 
  CardContent, 
  TextField, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid, 
  Alert, 
  CircularProgress
} from '@mui/material';
import { EventService } from '../services/EventService';
import { EventDetail } from '../types/Event';
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { es } from 'date-fns/locale';

interface Location {
  name: string;
  address: string;
  city: string;
  country: string;
}

interface Image {
  url: string;
  alt: string;
}

interface Ticket {
  id: string;
  value: number;
  currency: string;
  type: string;
  isFree: boolean;
  stock: number;
}

const CreateOrUpdateEventsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<EventDetail>({
    id: '',
    title: '',
    date: '',
    location: {
      name: '',
      address: '',
      city: '',
      country: ''
    },
    image: {
      url: '',
      alt: ''
    },
    tickets: [] as Ticket[],
    description: '',
    additionalInfo: [] as string[],
    status: 'ACTIVE',
    organizer: null
  });

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const event = await EventService.getEventById(id!);
      setEvent(event);
    } catch (err) {
      setError('Error al cargar el evento');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EventDetail, value: any) => {
    setEvent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (field: keyof Location, value: string) => {
    setEvent(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const handleImageChange = (field: keyof Image, value: string) => {
    setEvent(prev => ({
      ...prev,
      image: {
        ...prev.image,
        [field]: value
      }
    }));
  };

  const handleTicketChange = (index: number, field: keyof Ticket, value: any) => {
    setEvent(prev => ({
      ...prev,
      tickets: prev.tickets.map((ticket, i) => 
        i === index ? { ...ticket, [field]: value } : ticket
      )
    }));
  };

  const handleAdditionalInfoChange = (index: number, value: string) => {
    setEvent(prev => ({
      ...prev,
      additionalInfo: prev.additionalInfo.map((info, i) => 
        i === index ? value : info
      )
    }));
  };

  const addTicket = () => {
    setEvent(prev => ({
      ...prev,
      tickets: [...prev.tickets, {
        id: Date.now().toString(),
        value: 0,
        currency: '$',
        type: '',
        isFree: false,
        stock: 0
      }]
    }));
  };

  const removeTicket = (index: number) => {
    setEvent(prev => ({
      ...prev,
      tickets: prev.tickets.filter((_, i) => i !== index)
    }));
  };

  const addAdditionalInfo = () => {
    setEvent(prev => ({
      ...prev,
      additionalInfo: [...prev.additionalInfo, '']
    }));
  };

  const removeAdditionalInfo = (index: number) => {
    setEvent(prev => ({
      ...prev,
      additionalInfo: prev.additionalInfo.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      if (id) {
        await EventService.updateEventById(id!, event);
      } else {
        await EventService.createEvent(event);
      }

      navigate('/events');
    } catch (err) {
      setError('Error al guardar el evento');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {id ? 'Editar Evento' : 'Crear Evento'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Info */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Título"
                  value={event.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  margin="normal"
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                input de fecha
                {/* <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <DateTimePicker
                    label="Fecha y Hora"
                    value={new Date(event.date)}
                    onChange={(newValue: Date | null) => handleInputChange('date', newValue?.toISOString() || '')}
                    renderInput={(params: TextFieldProps) => <TextField {...params} fullWidth margin="normal" required />}
                  />
                </LocalizationProvider> */}
              </Grid>

              {/* Location */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Ubicación
                </Typography>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={event.location.name}
                  onChange={(e) => handleLocationChange('name', e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Dirección"
                  value={event.location.address}
                  onChange={(e) => handleLocationChange('address', e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Ciudad"
                  value={event.location.city}
                  onChange={(e) => handleLocationChange('city', e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="País"
                  value={event.location.country}
                  onChange={(e) => handleLocationChange('country', e.target.value)}
                  margin="normal"
                  required
                />
              </Grid>

              {/* Image */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Imagen
                </Typography>
                <TextField
                  fullWidth
                  label="URL de la imagen"
                  value={event.image.url}
                  onChange={(e) => handleImageChange('url', e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Texto alternativo"
                  value={event.image.alt}
                  onChange={(e) => handleImageChange('alt', e.target.value)}
                  margin="normal"
                  required
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  multiline
                  rows={4}
                  value={event.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  margin="normal"
                  required
                />
              </Grid>

              {/* Additional Info */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Información Adicional
                </Typography>
                {event.additionalInfo.map((info, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TextField
                      fullWidth
                      value={info}
                      onChange={(e) => handleAdditionalInfoChange(index, e.target.value)}
                      margin="normal"
                    />
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removeAdditionalInfo(index)}
                      sx={{ ml: 2 }}
                    >
                      Eliminar
                    </Button>
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  onClick={addAdditionalInfo}
                  sx={{ mt: 2 }}
                >
                  Agregar Información
                </Button>
              </Grid>

              {/* Tickets */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Boletas
                </Typography>
                {event.tickets.map((ticket, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Boleta {index + 1}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Tipo"
                          value={ticket.type}
                          onChange={(e) => handleTicketChange(index, 'type', e.target.value)}
                          margin="normal"
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          label="Valor"
                          type="number"
                          value={ticket.value}
                          onChange={(e) => handleTicketChange(index, 'value', Number(e.target.value))}
                          margin="normal"
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <FormControl fullWidth margin="normal">
                          <InputLabel>Moneda</InputLabel>
                          <Select
                            value={ticket.currency}
                            onChange={(e) => handleTicketChange(index, 'currency', e.target.value)}
                            label="Moneda"
                          >
                            <MenuItem value="$">$</MenuItem>
                            <MenuItem value="COP">COP</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          label="Stock"
                          type="number"
                          value={ticket.stock}
                          onChange={(e) => handleTicketChange(index, 'stock', Number(e.target.value))}
                          margin="normal"
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <FormControl fullWidth margin="normal">
                          <InputLabel>Gratuito</InputLabel>
                          <Select
                            value={ticket.isFree ? 'true' : 'false'}
                            onChange={(e) => handleTicketChange(index, 'isFree', e.target.value === 'true')}
                            label="Gratuito"
                          >
                            <MenuItem value="true">Sí</MenuItem>
                            <MenuItem value="false">No</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removeTicket(index)}
                      sx={{ mt: 2 }}
                    >
                      Eliminar Boleta
                    </Button>
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  onClick={addTicket}
                  sx={{ mt: 2 }}
                >
                  Agregar Boleta
                </Button>
              </Grid>

              {/* Status */}
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={event.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    label="Estado"
                  >
                    <MenuItem value="ACTIVE">Activo</MenuItem>
                    <MenuItem value="INACTIVE">Inactivo</MenuItem>
                    <MenuItem value="SOLD_OUT">Agotado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{ mt: 3 }}
                >
                  {loading ? <CircularProgress size={24} /> : id ? 'Actualizar Evento' : 'Crear Evento'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateOrUpdateEventsPage;
