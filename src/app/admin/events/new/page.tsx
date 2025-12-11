// src/app/admin/events/new/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Switch,
  CircularProgress,
  FormControlLabel,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import { EventService } from '@/services/EventService';
import type { EventDetail, Ticket } from '@/types/Event';
import { useAuth } from '@/app/contexts/AuthContext';
import { SUPPORTED_COUNTRIES, CITIES_BY_COUNTRY } from '@/constants/countries';
import { sanitizeString, sanitizeUrl } from '@/utils/sanitize';

type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED';

function uuid() {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

function defaultCurrencyByCountry(country: string) {
  return country === 'Colombia' ? 'COP' : 'ARS';
}

// Obtener fecha mínima permitida (mañana)
function getMinDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString().slice(0, 16);
}

// Obtener fecha inicial por defecto (mañana a las 20:00)
function getDefaultDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(20, 0, 0, 0);
  return tomorrow.toISOString();
}

type FormErrors = {
  title?: string;
  description?: string;
  date?: string;
  locationName?: string;
  locationAddress?: string;
  locationCity?: string;
  locationCountry?: string;
  tickets?: string;
  imageUrl?: string;
};

export default function NewEventPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const hasBackoffice = !!user && (user.role === 'admin' || user.role === 'seller');

  const [formData, setFormData] = useState<Omit<EventDetail, 'id'> & { status: EventStatus }>({
    title: '',
    date: getDefaultDate(),
    image: { url: '', alt: '' },
    tickets: [
      {
        id: 't-' + uuid(),
        type: 'Entrada General',
        value: 0,
        currency: 'ARS',
        isFree: false,
        stock: 100,
      },
    ],
    description: '',
    additionalInfo: [],
    organizer: null,
    status: 'DRAFT',
    location: {
      name: '',
      address: '',
      city: '',
      country: 'Argentina',
    },
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Ciudades disponibles según el país seleccionado
  const availableCities = useMemo(() => {
    return CITIES_BY_COUNTRY[formData.location.country] || [];
  }, [formData.location.country]);

  // Guards
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/auth/login?next=/admin/events/new');
      return;
    }
    if (!hasBackoffice) {
      router.replace('/');
      return;
    }
  }, [isLoading, isAuthenticated, hasBackoffice, router]);

  // Ajusta moneda y limpia ciudad cuando cambia el país
  useEffect(() => {
    const cur = defaultCurrencyByCountry(formData.location.country);
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, city: '' }, // Limpiar ciudad al cambiar país
      tickets: prev.tickets.map((t) => ({ ...t, currency: t.isFree ? t.currency : cur })),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.location.country]);

  const handleBack = () => router.push('/admin/events');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleLocationChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, location: { ...prev.location, [field]: value } }));
    // Limpiar error
    const errorKey = `location${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof FormErrors;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: undefined }));
    }
  };

  const handleTicketChange = <K extends keyof Ticket>(index: number, field: K, value: unknown) => {
    const updated = [...formData.tickets];
    
    let coerced: Ticket[K];
    if (field === 'value' || field === 'stock') {
      const numValue = Number(value);
      coerced = (isNaN(numValue) ? 0 : Math.max(0, numValue)) as Ticket[K];
    } else if (field === 'isFree') {
      coerced = Boolean(value) as unknown as Ticket[K];
    } else {
      coerced = String(value) as unknown as Ticket[K];
    }

    updated[index] = { ...updated[index], [field]: coerced };

    if (field === 'isFree' && coerced === true) {
      updated[index].value = 0 as unknown as number;
    }

    setFormData((prev) => ({ ...prev, tickets: updated }));
    if (errors.tickets) {
      setErrors((prev) => ({ ...prev, tickets: undefined }));
    }
  };

  const addTicket = () => {
    setFormData((prev) => ({
      ...prev,
      tickets: [
        ...prev.tickets,
        {
          id: 't-' + uuid(),
          type: 'Nueva entrada',
          value: 0,
          currency: defaultCurrencyByCountry(prev.location.country),
          isFree: false,
          stock: 100,
        },
      ],
    }));
  };

  const removeTicket = (index: number) => {
    if (formData.tickets.length <= 1) return;
    const updated = [...formData.tickets];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, tickets: updated }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Título obligatorio
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    } else if (formData.title.length < 5) {
      newErrors.title = 'El título debe tener al menos 5 caracteres';
    }

    // Descripción obligatoria
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    } else if (formData.description.length < 20) {
      newErrors.description = 'La descripción debe tener al menos 20 caracteres';
    }

    // Fecha no puede ser anterior a mañana
    const eventDate = new Date(formData.date);
    const minDate = new Date(getMinDate());
    if (eventDate < minDate) {
      newErrors.date = 'La fecha debe ser al menos un día después de hoy';
    }

    // Ubicación
    if (!formData.location.name.trim()) {
      newErrors.locationName = 'El nombre del lugar es obligatorio';
    }
    if (!formData.location.address.trim()) {
      newErrors.locationAddress = 'La dirección es obligatoria';
    }
    if (!formData.location.city) {
      newErrors.locationCity = 'Selecciona una ciudad';
    }
    if (!formData.location.country) {
      newErrors.locationCountry = 'Selecciona un país';
    }

    // Tickets - al menos uno con stock > 0
    const hasValidTicket = formData.tickets.some(t => t.stock > 0 && t.type.trim());
    if (!hasValidTicket) {
      newErrors.tickets = 'Debe haber al menos una entrada con stock mayor a 0';
    }

    // Imagen URL (opcional pero si la pone debe ser válida)
    if (formData.image.url && !formData.image.url.startsWith('http')) {
      newErrors.imageUrl = 'La URL de la imagen debe comenzar con http:// o https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Por favor, corrige los errores en el formulario antes de guardar.',
        severity: 'error',
      });
      return;
    }

    setSaving(true);

    try {
      const status = formData.status === 'PUBLISHED' ? 'ACTIVE' as const : formData.status;

      // Sanitizar todos los datos antes de enviarlos al backend
      const sanitizedTitle = sanitizeString(formData.title);
      const sanitizedDescription = sanitizeString(formData.description);
      const sanitizedImageUrl = sanitizeUrl(formData.image.url) || 'https://via.placeholder.com/800x400?text=Evento';

      const payload: Omit<EventDetail, 'id'> = {
        title: sanitizedTitle,
        date: new Date(formData.date).toISOString(),
        image: {
          url: sanitizedImageUrl,
          alt: sanitizeString(formData.image.alt) || sanitizedTitle,
        },
        tickets: formData.tickets.map((t) => ({
          id: t.id,
          type: sanitizeString(t.type),
          value: Math.max(0, Number(t.value || 0)),
          currency: t.isFree ? defaultCurrencyByCountry(formData.location.country) : t.currency,
          isFree: !!t.isFree,
          stock: Math.max(0, Math.floor(Number(t.stock || 0))),
        })),
        description: sanitizedDescription,
        additionalInfo: (formData.additionalInfo || []).map(info => sanitizeString(info)),
        location: {
          name: sanitizeString(formData.location.name),
          address: sanitizeString(formData.location.address),
          city: sanitizeString(formData.location.city),
          country: sanitizeString(formData.location.country),
        },
        status,
        organizer: formData.organizer ?? null,
      };

      const created = await EventService.createEvent(payload);
      
      setSnackbar({
        open: true,
        message: '¡Evento creado exitosamente! Redirigiendo...',
        severity: 'success',
      });

      // Esperar un momento para mostrar el mensaje y luego redirigir
      setTimeout(() => {
        router.push(`/admin/events/${created.id}/edit`);
      }, 1500);
    } catch (err) {
      console.error('Error al crear evento:', err);
      setSnackbar({
        open: true,
        message: 'No se pudo crear el evento. Verifica tu conexión e intenta nuevamente.',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <BackofficeLayout title="Nuevo Evento">
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
          <IconButton onClick={handleBack} title="Volver a mis eventos">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Nuevo Evento
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            onClick={handleSubmit}
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar Evento'}
          </Button>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Información Básica
                  </Typography>

                  <TextField
                    fullWidth
                    label="Título del Evento *"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    margin="normal"
                    error={!!errors.title}
                    helperText={errors.title || 'Ej: Concierto de Rock en Buenos Aires'}
                    placeholder="Nombre del evento"
                  />

                  <TextField
                    fullWidth
                    label="Descripción *"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    margin="normal"
                    multiline
                    rows={4}
                    error={!!errors.description}
                    helperText={errors.description || 'Describe el evento en detalle (mínimo 20 caracteres)'}
                    placeholder="Cuéntale a tu audiencia de qué se trata el evento..."
                  />

                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Fecha y hora del evento *"
                    value={formData.date ? new Date(formData.date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, date: new Date(e.target.value).toISOString() }));
                      if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
                    }}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: getMinDate() }}
                    error={!!errors.date}
                    helperText={errors.date || 'El evento debe ser al menos un día después de hoy'}
                  />

                  <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
                    📍 Ubicación
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth margin="normal" error={!!errors.locationCountry}>
                        <InputLabel>País *</InputLabel>
                        <Select
                          value={formData.location.country}
                          label="País *"
                          onChange={(e) => handleLocationChange('country', e.target.value)}
                        >
                          {SUPPORTED_COUNTRIES.map((country) => (
                            <MenuItem key={country} value={country}>
                              {country === 'Argentina' ? '🇦🇷 Argentina' : '🇨🇴 Colombia'}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.locationCountry && <FormHelperText>{errors.locationCountry}</FormHelperText>}
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth margin="normal" error={!!errors.locationCity}>
                        <InputLabel>Ciudad *</InputLabel>
                        <Select
                          value={formData.location.city}
                          label="Ciudad *"
                          onChange={(e) => handleLocationChange('city', e.target.value)}
                          disabled={availableCities.length === 0}
                        >
                          {availableCities.map((city) => (
                            <MenuItem key={city} value={city}>
                              {city}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.locationCity && <FormHelperText>{errors.locationCity}</FormHelperText>}
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Nombre del lugar *"
                        value={formData.location.name}
                        onChange={(e) => handleLocationChange('name', e.target.value)}
                        margin="normal"
                        error={!!errors.locationName}
                        helperText={errors.locationName || 'Ej: Estadio Monumental, Teatro Colón'}
                        placeholder="Nombre del venue o lugar"
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Dirección *"
                        value={formData.location.address}
                        onChange={(e) => handleLocationChange('address', e.target.value)}
                        margin="normal"
                        error={!!errors.locationAddress}
                        helperText={errors.locationAddress || 'Dirección completa del lugar'}
                        placeholder="Calle, número, barrio..."
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">🎟️ Entradas</Typography>
                    <Button variant="outlined" size="small" onClick={addTicket} startIcon={<AddIcon />}>
                      Agregar entrada
                    </Button>
                  </Box>

                  {errors.tickets && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {errors.tickets}
                    </Alert>
                  )}

                  {formData.tickets.map((ticket, index) => (
                    <Card key={ticket.id} variant="outlined" sx={{ p: 2, mb: 2, position: 'relative' }}>
                      {formData.tickets.length > 1 && (
                        <IconButton
                          size="small"
                          sx={{ position: 'absolute', top: 8, right: 8 }}
                          onClick={() => removeTicket(index)}
                          color="error"
                          title="Eliminar entrada"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}

                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            label="Tipo de entrada *"
                            value={ticket.type}
                            onChange={(e) => handleTicketChange(index, 'type', e.target.value)}
                            margin="normal"
                            size="small"
                            placeholder="Ej: General, VIP, Platea"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <FormControl fullWidth margin="normal" size="small" disabled={ticket.isFree}>
                            <InputLabel>Moneda</InputLabel>
                            <Select
                              value={ticket.currency}
                              label="Moneda"
                              onChange={(e) => handleTicketChange(index, 'currency', e.target.value)}
                            >
                              <MenuItem value="ARS">ARS - Peso Argentino</MenuItem>
                              <MenuItem value="COP">COP - Peso Colombiano</MenuItem>
                              <MenuItem value="USD">USD - Dólar</MenuItem>
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
                            inputProps={{ min: 0 }}
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
                            label="Cantidad disponible *"
                            type="number"
                            value={ticket.stock}
                            onChange={(e) => handleTicketChange(index, 'stock', e.target.value)}
                            margin="normal"
                            size="small"
                            inputProps={{ min: 1 }}
                            helperText="¿Cuántas entradas de este tipo están disponibles?"
                          />
                        </Grid>
                      </Grid>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🖼️ Imagen del Evento (opcional)
                  </Typography>
                  <TextField
                    fullWidth
                    label="URL de la imagen"
                    name="url"
                    value={formData.image.url}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, image: { ...prev.image, url: e.target.value } }));
                      if (errors.imageUrl) setErrors((prev) => ({ ...prev, imageUrl: undefined }));
                    }}
                    margin="normal"
                    error={!!errors.imageUrl}
                    helperText={errors.imageUrl || 'URL de la imagen del banner (recomendado: 800x400px)'}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  <TextField
                    fullWidth
                    label="Texto alternativo"
                    name="alt"
                    value={formData.image.alt}
                    onChange={(e) => setFormData((prev) => ({ ...prev, image: { ...prev.image, alt: e.target.value } }))}
                    margin="normal"
                    helperText="Descripción de la imagen para accesibilidad"
                    placeholder="Descripción de la imagen"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ⚙️ Estado del Evento
                  </Typography>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={formData.status}
                      label="Estado"
                      onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as EventStatus }))}
                    >
                      <MenuItem value="DRAFT">📝 Borrador</MenuItem>
                      <MenuItem value="PUBLISHED">✅ Publicado</MenuItem>
                      <MenuItem value="CANCELLED">❌ Cancelado</MenuItem>
                    </Select>
                    <FormHelperText>
                      {formData.status === 'DRAFT' && 'El evento no será visible al público hasta que lo publiques'}
                      {formData.status === 'PUBLISHED' && 'El evento será visible y se podrán comprar entradas'}
                      {formData.status === 'CANCELLED' && 'El evento ha sido cancelado y no se mostrarán entradas'}
                    </FormHelperText>
                  </FormControl>

                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Consejo:</strong> Puedes guardar como borrador y publicar después cuando todo esté listo.
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </form>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </BackofficeLayout>
  );
}
