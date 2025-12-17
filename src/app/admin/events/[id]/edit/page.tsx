// src/app/admin/events/[id]/edit/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { EventService } from '@/services/EventService';
import type { EventDetail, Ticket } from '@/types/Event';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import { useAuth } from '@/app/contexts/AuthContext';
import { SUPPORTED_COUNTRIES, CITIES_BY_COUNTRY } from '@/constants/countries';
import { sanitizeString, sanitizeUrl } from '@/utils/sanitize';
import { EVENT_TAGS } from '@/constants/eventTags';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';

type EventStatus = 'DRAFT' | 'ACTIVE' | 'CANCELLED';

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

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const isSeller = user?.role === 'seller';
  const hasBackoffice = !!user && (user.role === 'admin' || user.role === 'seller');

  const [originalEvent, setOriginalEvent] = useState<EventDetail | null>(null);
  const [formData, setFormData] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Ciudades disponibles según el país seleccionado
  const availableCities = useMemo(() => {
    return formData?.location?.country ? CITIES_BY_COUNTRY[formData.location.country] || [] : [];
  }, [formData?.location?.country]);

  // Guards
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/auth/login?next=' + encodeURIComponent(`/admin/events/${id}/edit`));
      return;
    }
    if (!hasBackoffice) {
      router.replace('/');
      return;
    }
  }, [isLoading, isAuthenticated, hasBackoffice, id, router]);

  // Cargar evento
  useEffect(() => {
    if (!id || !isAuthenticated || !hasBackoffice) return;
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const eventData = await EventService.getEventById(id);
        
        // Verificar permisos si es seller
        if (isSeller && user && eventData.organizer?.id && eventData.organizer.id !== String(user.id)) {
          setError('No tienes permisos para editar este evento.');
          return;
        }
        
        if (active) {
          setOriginalEvent(eventData);
          setFormData(eventData);
        }
      } catch (err) {
        console.error('Error al cargar el evento:', err);
        if (active) setError('Error al cargar el evento');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, isAuthenticated, hasBackoffice, isSeller, user]);

  const handleBack = () => router.push('/admin/events');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData((prev) => prev ? { ...prev, [name]: value } : null);
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleLocationChange = (field: string, value: string) => {
    if (!formData) return;
    setFormData((prev) => prev ? { ...prev, location: { ...prev.location, [field]: value } } : null);
    const errorKey = `location${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof FormErrors;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: undefined }));
    }
  };

  const handleTicketChange = <K extends keyof Ticket>(index: number, field: K, value: unknown) => {
    if (!formData) return;
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

    setFormData((prev) => prev ? { ...prev, tickets: updated } : null);
    if (errors.tickets) {
      setErrors((prev) => ({ ...prev, tickets: undefined }));
    }
  };

  const addTicket = () => {
    if (!formData) return;
    setFormData((prev) => prev ? {
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
    } : null);
  };

  const removeTicket = (index: number) => {
    if (!formData || formData.tickets.length <= 1) return;
    const updated = [...formData.tickets];
    updated.splice(index, 1);
    setFormData((prev) => prev ? { ...prev, tickets: updated } : null);
  };

  const validateForm = (): boolean => {
    if (!formData) return false;
    const newErrors: FormErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    } else if (formData.title.length < 5) {
      newErrors.title = 'El título debe tener al menos 5 caracteres';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    } else if (formData.description.length < 20) {
      newErrors.description = 'La descripción debe tener al menos 20 caracteres';
    }

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

    const hasValidTicket = formData.tickets.some(t => t.stock > 0 && t.type.trim());
    if (!hasValidTicket) {
      newErrors.tickets = 'Debe haber al menos una entrada con stock mayor a 0';
    }

    if (formData.image.url && !formData.image.url.startsWith('http')) {
      newErrors.imageUrl = 'La URL de la imagen debe comenzar con http:// o https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
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
      const sanitizedTitle = sanitizeString(formData.title);
      const sanitizedDescription = sanitizeString(formData.description);
      const sanitizedImageUrl = sanitizeUrl(formData.image.url) || 'https://via.placeholder.com/800x400?text=Evento';

      const payload: Partial<EventDetail> = {
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
      };

      await EventService.updateEvent(id, payload);
      
      setSnackbar({
        open: true,
        message: '¡Evento actualizado exitosamente!',
        severity: 'success',
      });

      // Actualizar el evento original
      setOriginalEvent(formData);
    } catch (err) {
      console.error('Error al actualizar evento:', err);
      setSnackbar({
        open: true,
        message: 'No se pudo actualizar el evento. Verifica tu conexión e intenta nuevamente.',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await EventService.deleteEvent(id);
      setSnackbar({
        open: true,
        message: 'Evento eliminado correctamente',
        severity: 'success',
      });
      setTimeout(() => router.push('/admin/events'), 1500);
    } catch (err) {
      console.error('Error al eliminar evento:', err);
      setSnackbar({
        open: true,
        message: 'No se pudo eliminar el evento',
        severity: 'error',
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (isLoading || loading) {
    return (
      <BackofficeLayout title="Editar Evento">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </BackofficeLayout>
    );
  }

  if (error) {
    return (
      <BackofficeLayout title="Editar Evento">
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          <Button component={Link} href="/admin/events" startIcon={<ArrowBackIcon />}>
            Volver a la lista de eventos
          </Button>
        </Box>
      </BackofficeLayout>
    );
  }

  if (!formData) {
    return (
      <BackofficeLayout title="Editar Evento">
        <Box sx={{ p: 3 }}>
          <Alert severity="warning">Evento no encontrado</Alert>
          <Button component={Link} href="/admin/events" sx={{ mt: 2 }} startIcon={<ArrowBackIcon />}>
            Volver a la lista de eventos
          </Button>
        </Box>
      </BackofficeLayout>
    );
  }

  return (
    <BackofficeLayout title={`Editar: ${formData.title}`}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
          <IconButton onClick={handleBack} title="Volver a mis eventos">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            Editar Evento
          </Typography>
          <Button
            component={Link}
            href={`/events/${id}`}
            target="_blank"
            variant="outlined"
            startIcon={<VisibilityIcon />}
            sx={{ mr: 1 }}
          >
            Ver como comprador
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
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
                    helperText={errors.title}
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
                    helperText={errors.description}
                  />

                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Fecha y hora del evento *"
                    value={formData.date ? new Date(formData.date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => {
                      setFormData((prev) => prev ? { ...prev, date: new Date(e.target.value).toISOString() } : null);
                      if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
                    }}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.date}
                    helperText={errors.date}
                  />

                  <Autocomplete
                    multiple
                    options={EVENT_TAGS}
                    value={formData?.tags || []}
                    onChange={(_, newValue) => {
                      setFormData((prev) => prev ? { ...prev, tags: newValue } : null);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tags del evento"
                        placeholder="Selecciona tags..."
                        margin="normal"
                        helperText="Etiquetas que ayudan a categorizar tu evento"
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                        const { key, ...tagProps } = getTagProps({ index });
                        return (
                          <Chip
                            {...tagProps}
                            key={key}
                            label={option}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        );
                      })
                    }
                    sx={{ mt: 2 }}
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
                        helperText={errors.locationName}
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
                        helperText={errors.locationAddress}
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
                    <Card key={ticket.id} variant="outlined" sx={{ p: 2, mb: 2, position: 'relative', pt: 4 }}>
                      {formData.tickets.length > 1 && (
                        <IconButton
                          size="small"
                          sx={{ position: 'absolute', top: 4, right: 4, zIndex: 1 }}
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
                              <MenuItem value="$">$ (Símbolo genérico)</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            label="Precio"
                            type="number"
                            value={ticket.value === 0 ? '' : ticket.value}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : Number(e.target.value);
                              handleTicketChange(index, 'value', val);
                            }}
                            margin="normal"
                            size="small"
                            disabled={ticket.isFree}
                            slotProps={{ htmlInput: { min: 0, step: 'any' } }}
                            placeholder="0"
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
                            value={ticket.stock === 0 ? '' : ticket.stock}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                              handleTicketChange(index, 'stock', val);
                            }}
                            margin="normal"
                            size="small"
                            slotProps={{ htmlInput: { min: 0, step: 1 } }}
                            placeholder="100"
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
                    🖼️ Imagen del Evento
                  </Typography>
                  <TextField
                    fullWidth
                    label="URL de la imagen"
                    value={formData.image.url}
                    onChange={(e) => {
                      setFormData((prev) => prev ? { ...prev, image: { ...prev.image, url: e.target.value } } : null);
                      if (errors.imageUrl) setErrors((prev) => ({ ...prev, imageUrl: undefined }));
                    }}
                    margin="normal"
                    error={!!errors.imageUrl}
                    helperText={errors.imageUrl}
                  />
                  <TextField
                    fullWidth
                    label="Texto alternativo"
                    value={formData.image.alt}
                    onChange={(e) => setFormData((prev) => prev ? { ...prev, image: { ...prev.image, alt: e.target.value } } : null)}
                    margin="normal"
                  />

                  {formData.image.url && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Vista previa:</Typography>
                      <Box
                        component="img"
                        src={formData.image.url}
                        alt={formData.image.alt || formData.title}
                        sx={{ maxWidth: '100%', maxHeight: 200, borderRadius: 1, objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ⚙️ Estado del Evento
                  </Typography>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={formData.status || 'ACTIVE'}
                      label="Estado"
                      onChange={(e) => setFormData((prev) => prev ? { ...prev, status: e.target.value as EventStatus } : null)}
                    >
                      <MenuItem value="DRAFT">📝 Borrador</MenuItem>
                      <MenuItem value="ACTIVE">✅ Activo</MenuItem>
                      <MenuItem value="CANCELLED">❌ Cancelado</MenuItem>
                    </Select>
                    <FormHelperText>
                      {formData.status === 'DRAFT' && 'El evento no será visible al público'}
                      {formData.status === 'ACTIVE' && 'El evento está visible y se pueden comprar entradas'}
                      {formData.status === 'CANCELLED' && 'El evento ha sido cancelado'}
                    </FormHelperText>
                  </FormControl>
                </CardContent>
              </Card>

              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📊 Acciones rápidas
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      component={Link}
                      href={`/admin/events/${id}/sales`}
                      variant="outlined"
                      fullWidth
                    >
                      Ver ventas
                    </Button>
                    <Button
                      component={Link}
                      href={`/admin/events/${id}/validate`}
                      variant="outlined"
                      fullWidth
                    >
                      Validar entradas
                    </Button>
                    <Button
                      component={Link}
                      href={`/admin/events/${id}`}
                      variant="outlined"
                      fullWidth
                    >
                      Ver detalles
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {user?.role === 'admin' && (
                <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      ⚠️ Zona de peligro
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Esta acción no se puede deshacer.
                    </Typography>
                    <Button
                      variant="contained"
                      color="error"
                      fullWidth
                      onClick={() => setDeleteDialogOpen(true)}
                      startIcon={<DeleteIcon />}
                    >
                      Eliminar evento
                    </Button>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </form>
      </Box>

      {/* Dialog de confirmación para eliminar */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>¿Eliminar evento?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Estás a punto de eliminar el evento &quot;{formData.title}&quot;. Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? <CircularProgress size={20} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

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
