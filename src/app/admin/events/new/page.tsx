'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, Button, Card, CardContent, Divider, 
  Grid, IconButton, TextField, Typography, 
  useMediaQuery, useTheme, MenuItem, FormControl, 
  InputLabel, Select, FormHelperText, Switch, CircularProgress,
  FormControlLabel
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es, id } from 'date-fns/locale';

import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import { EventService } from '@/services/EventService';
import { EventDetail } from '@/types/event';
import { AuthService } from '@/services/AuthService';
import { randomUUID } from 'crypto';

export default function NewEventPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [formData, setFormData] = useState<Omit<EventDetail, 'id'>>({
    title: '',
    date: new Date().toISOString(),
    image: { url: '', alt: '' },
    tickets: [{
      id: 'temp-1',
      type: 'Entrada General',
      value: 0,
      currency: 'ARS',
      isFree: false,
      stock: 0
    }],
    description: '',
    additionalInfo: [''],
    organizer: null,
    status: 'DRAFT',
    location: {
      name: '',
      address: '',
      city: '',
      country: 'Argentina'
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication and admin status
  React.useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    
    if (!AuthService.isAdmin()) {
      router.push('/');
      return;
    }
  }, [router]);

  const handleBack = () => router.push('/admin/events');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value
      }
    }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        date: date.toISOString()
      }));
    }
  };

  const handleTicketChange = (index: number, field: string, value: any) => {
    const updatedTickets = [...formData.tickets];
    updatedTickets[index] = {
      ...updatedTickets[index],
      [field]: field === 'value' || field === 'stock' ? Number(value) : value
    };
    setFormData(prev => ({
      ...prev,
      tickets: updatedTickets
    }));
  };

  const addTicket = () => {
    setFormData(prev => ({
      ...prev,
      tickets: [
        ...prev.tickets,
        {
          id: `temp-${Date.now()}`,
          type: 'Nueva entrada',
          value: 0,
          currency: 'ARS',
          isFree: false,
          stock: 0
        }
      ]
    }));
  };

  const removeTicket = (index: number) => {
    if (formData.tickets.length <= 1) return;
    
    const updatedTickets = [...formData.tickets];
    updatedTickets.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      tickets: updatedTickets
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const eventData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        tickets: formData.tickets.map(ticket => ({
          ...ticket,
          id: ticket.id.startsWith('temp-') ? randomUUID() : ticket.id
        })),
        id: randomUUID()
      };
      
      const createdEvent = await EventService.createEvent(eventData);
      router.push(`/admin/events/${createdEvent.id}`);
      
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Error al crear el evento. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackofficeLayout title="Nuevo Evento">
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Nuevo Evento
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Evento'}
          </Button>
        </Box>

        {error && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 1 }}>
            {error}
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Información Básica</Typography>
                  
                  <TextField
                    fullWidth
                    label="Título del Evento"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    margin="normal"
                    required
                  />
                  
                  <TextField
                    fullWidth
                    label="Descripción"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    margin="normal"
                    multiline
                    rows={4}
                    required
                  />
                  
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <DatePicker
                          label="Fecha del evento"
                          value={new Date(formData.date)}
                          onChange={handleDateChange}
                          slotProps={{
                            textField: { fullWidth: true, required: true, margin: 'normal' }
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TimePicker
                          label="Hora del evento"
                          value={new Date(formData.date)}
                          onChange={handleDateChange}
                          slotProps={{
                            textField: { fullWidth: true, margin: 'normal' }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </LocalizationProvider>

                  <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>Ubicación</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Nombre del lugar"
                        name="name"
                        value={formData.location.name}
                        onChange={handleLocationChange}
                        margin="normal"
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Dirección"
                        name="address"
                        value={formData.location.address}
                        onChange={handleLocationChange}
                        margin="normal"
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Ciudad"
                        name="city"
                        value={formData.location.city}
                        onChange={handleLocationChange}
                        margin="normal"
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="País"
                        name="country"
                        value={formData.location.country}
                        onChange={handleLocationChange}
                        margin="normal"
                        disabled
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Entradas</Typography>
                    <Button variant="outlined" size="small" onClick={addTicket} startIcon={<AddIcon />}>
                      Agregar entrada
                    </Button>
                  </Box>
                  
                  {formData.tickets.map((ticket, index) => (
                    <Card key={ticket.id} variant="outlined" sx={{ p: 2, mb: 2, position: 'relative' }}>
                      {formData.tickets.length > 1 && (
                        <IconButton 
                          size="small" 
                          sx={{ position: 'absolute', top: 8, right: 8 }}
                          onClick={() => removeTicket(index)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                      
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            label="Tipo de entrada"
                            value={ticket.type}
                            onChange={(e) => handleTicketChange(index, 'type', e.target.value)}
                            margin="normal"
                            size="small"
                            required
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <FormControl fullWidth margin="normal" size="small">
                            <InputLabel>Moneda</InputLabel>
                            <Select
                              value={ticket.currency}
                              label="Moneda"
                              onChange={(e) => handleTicketChange(index, 'currency', e.target.value)}
                              disabled={ticket.isFree}
                            >
                              <MenuItem value="ARS">ARS - Peso Argentino</MenuItem>
                              <MenuItem value="USD">USD - Dólar Estadounidense</MenuItem>
                              <MenuItem value="EUR">EUR - Euro</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            label="Precio"
                            type="number"
                            value={ticket.value}
                            onChange={(e) => handleTicketChange(index, 'value', e.target.value)}
                            margin="normal"
                            size="small"
                            disabled={ticket.isFree}
                          />
                          <FormControlLabel
                            control={
                              <Switch
                                checked={ticket.isFree}
                                onChange={(e) => handleTicketChange(index, 'isFree', e.target.checked)}
                                color="primary"
                              />
                            }
                            label="Entrada gratuita"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            label="Cantidad disponible"
                            type="number"
                            value={ticket.stock}
                            onChange={(e) => handleTicketChange(index, 'stock', e.target.value)}
                            margin="normal"
                            size="small"
                            required
                          />
                        </Grid>
                      </Grid>
                    </Card>
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Imagen del Evento</Typography>
                  
                  <TextField
                    fullWidth
                    label="URL de la imagen"
                    name="url"
                    value={formData.image.url}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      image: { ...prev.image, url: e.target.value }
                    }))}
                    margin="normal"
                  />
                  
                  <TextField
                    fullWidth
                    label="Texto alternativo (para accesibilidad)"
                    name="alt"
                    value={formData.image.alt}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      image: { ...prev.image, alt: e.target.value }
                    }))}
                    margin="normal"
                    helperText="Describe la imagen para personas con discapacidad visual"
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Estado del Evento</Typography>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={formData.status}
                      label="Estado"
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <MenuItem value="DRAFT">Borrador</MenuItem>
                      <MenuItem value="PUBLISHED">Publicado</MenuItem>
                      <MenuItem value="CANCELLED">Cancelado</MenuItem>
                    </Select>
                    <FormHelperText>
                      {formData.status === 'DRAFT' && 'El evento no es visible al público'}
                      {formData.status === 'PUBLISHED' && 'El evento es visible al público'}
                      {formData.status === 'CANCELLED' && 'El evento ha sido cancelado'}
                    </FormHelperText>
                  </FormControl>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Organizador</Typography>
                  
                  <TextField
                    fullWidth
                    label="Nombre del organizador"
                    value={formData.organizer?.name || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      organizer: {
                        ...(prev.organizer || { id: '', name: '', url: '' }),
                        name: e.target.value
                      }
                    }))}
                    margin="normal"
                  />
                  
                  <TextField
                    fullWidth
                    label="Sitio web del organizador"
                    value={formData.organizer?.url || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      organizer: {
                        ...(prev.organizer || { id: '', name: '', url: '' }),
                        url: e.target.value
                      }
                    }))}
                    margin="normal"
                    placeholder="https://ejemplo.com"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </form>
      </Box>
    </BackofficeLayout>
  );
}
