// src/app/admin/events/new/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
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

export default function NewEventPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const hasBackoffice = !!user && (user.role === 'admin' || user.role === 'seller');

  const [formData, setFormData] = useState<Omit<EventDetail, 'id'> & { status: EventStatus }>({
    title: '',
    date: new Date().toISOString(),
    image: { url: '', alt: '' },
    tickets: [
      {
        id: 't-' + uuid(),
        type: 'Entrada General',
        value: 0,
        currency: 'ARS',
        isFree: false,
        stock: 0,
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
  const [error, setError] = useState<string | null>(null);

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

  // Ajusta moneda según país automáticamente
  useEffect(() => {
    const cur = defaultCurrencyByCountry(formData.location.country);
    setFormData((prev) => ({
      ...prev,
      tickets: prev.tickets.map((t) => ({ ...t, currency: t.isFree ? t.currency : cur })),
    }));
  }, [formData.location.country, formData.tickets]);

  const handleBack = () => router.push('/admin/events');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, location: { ...prev.location, [name]: value } }));
  };

  const handleTicketChange = <K extends keyof Ticket>(index: number, field: K, value: unknown) => {
    const updated = [...formData.tickets];
    
    // Type-safe coercion based on field type
    let coerced: Ticket[K];
    if (field === 'value' || field === 'stock') {
      const numValue = Number(value);
      coerced = (isNaN(numValue) ? 0 : numValue) as Ticket[K];
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
          stock: 0,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const status = formData.status === 'PUBLISHED' ? 'ACTIVE' as const : formData.status;

      const payload: Omit<EventDetail, 'id'> = {
        title: formData.title,
        date: new Date(formData.date).toISOString(),
        image: formData.image,
        tickets: formData.tickets.map((t) => ({
          id: t.id,
          type: t.type,
          value: Number(t.value || 0),
          currency: t.isFree ? defaultCurrencyByCountry(formData.location.country) : t.currency,
          isFree: !!t.isFree,
          stock: Number(t.stock || 0),
        })),
        description: formData.description || '',
        additionalInfo: formData.additionalInfo || [],
        location: formData.location,
        status,
        organizer: formData.organizer ?? null,
      };

      const created = await EventService.createEvent(payload);
      router.replace(`/admin/events/${created.id}`);
    } catch (err) {
       
      console.error(err);
      setError('Error al crear el evento. Por favor, intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BackofficeLayout title="Nuevo Evento">
      <Box sx={{ p: 3 }}>
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
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar Evento'}
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

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

                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Fecha y hora"
                    value={new Date(formData.date).toISOString().slice(0, 16)}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: new Date(e.target.value).toISOString() }))}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />

                  <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
                    Ubicación
                  </Typography>
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
                  <Typography variant="h6" gutterBottom>
                    Imagen del Evento
                  </Typography>
                  <TextField
                    fullWidth
                    label="URL de la imagen"
                    name="url"
                    value={formData.image.url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, image: { ...prev.image, url: e.target.value } }))}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Texto alternativo"
                    name="alt"
                    value={formData.image.alt}
                    onChange={(e) => setFormData((prev) => ({ ...prev, image: { ...prev.image, alt: e.target.value } }))}
                    margin="normal"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Estado del Evento
                  </Typography>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={formData.status}
                      label="Estado"
                      onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as EventStatus }))}
                    >
                      <MenuItem value="DRAFT">Borrador</MenuItem>
                      <MenuItem value="PUBLISHED">Publicado</MenuItem>
                      <MenuItem value="CANCELLED">Cancelado</MenuItem>
                    </Select>
                    <FormHelperText>
                      {formData.status === 'DRAFT' && 'El evento no es visible al público'}
                      {formData.status === 'PUBLISHED' && 'El evento será visible al público'}
                      {formData.status === 'CANCELLED' && 'El evento ha sido cancelado'}
                    </FormHelperText>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </form>
      </Box>
    </BackofficeLayout>
  );
}
