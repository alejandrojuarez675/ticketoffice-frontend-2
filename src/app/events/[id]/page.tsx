'use client';

import React, { useEffect, useMemo, useState } from 'react';
import LightLayout from '@/components/layouts/LightLayout';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  IconButton,
  TextField,
  Container,
  CircularProgress,
  Alert,
  Chip,
  Collapse,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
  Share as ShareIcon,
  Event as CalendarAddIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { EventService } from '@/services/EventService';
import type { EventDetail, Ticket } from '@/types/Event';
import Image from 'next/image';

function formatCurrency(value: number, currency: string) {
  try {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(value);
  } catch {
    return `$${value.toLocaleString('es-AR')} ${currency}`;
  }
}

function toICSDate(d: Date) {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function downloadICS(evt: EventDetail) {
  const start = new Date(evt.date);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const location = `${evt.location?.name ?? ''} ${evt.location?.address ?? ''} ${evt.location?.city ?? ''} ${evt.location?.country ?? ''}`.trim();

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TicketOffice//ES',
    'BEGIN:VEVENT',
    `UID:${evt.id}@ticketoffice`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${evt.title}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${(evt.description || '').replace(/\n/g, '\\n')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${evt.title.replace(/\s+/g, '_')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function EventDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const eventData = await EventService.getEventById(id as string);
        setEvent(eventData);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Error al cargar los detalles del evento. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEvent();
  }, [id]);

  useEffect(() => {
    if (selectedTicketId && event) {
      const ticket = event.tickets.find((t) => t.id === selectedTicketId) || null;
      setSelectedTicket(ticket);
      setQuantity(1);
    } else {
      setSelectedTicket(null);
      setQuantity(1);
    }
  }, [selectedTicketId, event]);

  const handleQuantityChange = (newQuantity: number) => {
    const max = selectedTicket?.stock ?? 1;
    setQuantity(Math.max(1, Math.min(newQuantity, max)));
  };

  const total = selectedTicket ? selectedTicket.value * quantity : 0;
  const fees = useMemo(() => (selectedTicket ? Math.round(selectedTicket.value * quantity * 0.1) : 0), [selectedTicket, quantity]);
  const grandTotal = total + fees;

  const formattedDate = useMemo(
    () =>
      event
        ? new Date(event.date).toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '',
    [event]
  );

  const handleCheckout = () => {
    if (!selectedTicket) return;
    const sp = new URLSearchParams({
      eventId: String(id),
      ticketId: selectedTicketId,
      quantity: String(quantity),
    });
    router.push(`/checkout?${sp.toString()}`);
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: event?.title || 'Evento', text: 'Mira este evento', url });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Enlace copiado al portapapeles');
      }
    } catch {
      // usuario canceló
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Evento no encontrado</Alert>
      </Container>
    );
  }

  const canBuy = !!selectedTicket && (selectedTicket?.stock ?? 0) > 0 && quantity >= 1;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        {event.title}
      </Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box mb={4}>
            <Box position="relative" sx={{ width: '100%', height: '400px', borderRadius: 2, overflow: 'hidden', mb: 3, bgcolor: 'grey.100' }}>
              {event.image?.url ? (
                <Image src={event.image.url} alt={event.image.alt || event.title} fill style={{ objectFit: 'cover' }} priority />
              ) : null}
            </Box>

            <Typography variant="h5" gutterBottom>Descripción</Typography>
            <Typography component="p" sx={{ mb: 2 }}>{event.description}</Typography>

            <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>Información Adicional</Typography>
            <List>
              <ListItem>
                <ListItemIcon><CalendarIcon color="primary" /></ListItemIcon>
                <ListItemText primary="Fecha y Hora" secondary={formattedDate} />
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemIcon><LocationIcon color="primary" /></ListItemIcon>
                <ListItemText
                  primary="Ubicación"
                  secondary={
                    <>
                      <Typography component="span" display="block">{event.location.name}</Typography>
                      <Typography component="span" variant="body2" color="text.secondary">
                        {event.location.address}, {event.location.city}, {event.location.country}
                      </Typography>
                    </>
                  }
                />
              </ListItem>

              {event.additionalInfo.map((info, index) => (
                <React.Fragment key={index}>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                    <ListItemText primary={info} />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 20 }}>
            <Typography variant="h5" gutterBottom>Selecciona tu entrada</Typography>

            <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
              <FormLabel component="legend">Tipo de entrada</FormLabel>
              <RadioGroup value={selectedTicketId} onChange={(e) => setSelectedTicketId(e.target.value)}>
                {event.tickets.map((ticket) => {
                  const disabled = ticket.stock <= 0;
                  return (
                    <Paper
                      key={ticket.id}
                      variant="outlined"
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 1,
                        borderColor: selectedTicketId === ticket.id ? 'primary.main' : 'divider',
                        borderWidth: selectedTicketId === ticket.id ? 2 : 1,
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        opacity: disabled ? 0.6 : 1,
                        '&:hover': { borderColor: disabled ? 'divider' : 'primary.main' },
                      }}
                      onClick={() => !disabled && setSelectedTicketId(ticket.id)}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
                        <Box>
                          <Typography variant="subtitle1">{ticket.type}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {ticket.stock} entradas disponibles
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          {disabled && <Chip size="small" label="Agotado" />}
                          <Typography variant="h6">
                            {ticket.isFree ? 'Gratis' : formatCurrency(ticket.value, ticket.currency)}
                          </Typography>
                        </Box>
                      </Box>
                      <Radio value={ticket.id} checked={selectedTicketId === ticket.id} sx={{ display: 'none' }} />
                    </Paper>
                  );
                })}
              </RadioGroup>
            </FormControl>

            {selectedTicket && (
              <>
                <Box mb={3}>
                  <FormLabel component="legend" sx={{ mb: 1, display: 'block' }}>Cantidad</FormLabel>
                  <Box display="flex" alignItems="center">
                    <IconButton onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity <= 1}>
                      <RemoveIcon />
                    </IconButton>
                    <TextField
                      value={quantity}
                      type="number"
                      slotProps={{ input: { inputProps: { min: 1, max: selectedTicket?.stock ?? 1, style: { textAlign: 'center' } } } }}
                      sx={{ width: '80px', mx: 1 }}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    />
                    <IconButton onClick={() => handleQuantityChange(quantity + 1)} disabled={quantity >= (selectedTicket?.stock || 1)}>
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="caption" color="text.secondary">Máximo {selectedTicket.stock} por compra</Typography>
                </Box>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Precio por entrada:</Typography>
                    <Typography>{formatCurrency(selectedTicket.value, selectedTicket.currency)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Cantidad:</Typography>
                    <Typography>{quantity}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="space-between" fontWeight="bold">
                    <Typography>Subtotal:</Typography>
                    <Typography>{formatCurrency(total, selectedTicket.currency)}</Typography>
                  </Box>

                  <Button
                    size="small"
                    endIcon={<ExpandMoreIcon sx={{ transform: showBreakdown ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />}
                    onClick={() => setShowBreakdown((v) => !v)}
                    sx={{ mt: 1 }}
                  >
                    Ver desglose
                  </Button>
                  <Collapse in={showBreakdown}>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography>Tasas (10%):</Typography>
                      <Typography>{formatCurrency(fees, selectedTicket.currency)}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" fontWeight="bold" mt={1}>
                      <Typography>Total:</Typography>
                      <Typography>{formatCurrency(grandTotal, selectedTicket.currency)}</Typography>
                    </Box>
                  </Collapse>
                </Box>

                <Box display="grid" gap={1}>
                  <Tooltip title={!canBuy ? 'Selecciona una entrada disponible' : ''}>
                    <span>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        onClick={handleCheckout}
                        startIcon={<CheckCircleIcon />}
                        disabled={!canBuy}
                      >
                        Comprar ahora
                      </Button>
                    </span>
                  </Tooltip>

                  <Box display="flex" gap={1}>
                    <Button fullWidth variant="outlined" startIcon={<ShareIcon />} onClick={handleShare}>
                      Compartir
                    </Button>
                    <Button fullWidth variant="outlined" startIcon={<CalendarAddIcon />} onClick={() => downloadICS(event)}>
                      Agregar al calendario
                    </Button>
                  </Box>
                </Box>
              </>
            )}
          </Paper>

          {event.organizer && (
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
              <Typography variant="h6" gutterBottom>Organizador</Typography>
              <Box display="flex" alignItems="center">
                {event.organizer.logoUrl && (
                  <Box component="img" src={event.organizer.logoUrl} alt={event.organizer.name} sx={{ width: 60, height: 60, borderRadius: 1, objectFit: 'contain', mr: 2 }} />
                )}
                <Box>
                  <Typography variant="subtitle1">{event.organizer.name}</Typography>
                  {event.organizer.url && (
                    <Typography
                      variant="body2"
                      color="primary"
                      component="a"
                      href={event.organizer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      Ver más eventos
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default function EventDetailPage() {
  return (
    <LightLayout title="Detalles del Evento - TicketOffice">
      <EventDetailContent />
    </LightLayout>
  );
}