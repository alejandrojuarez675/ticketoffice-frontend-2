'use client';

import React, { useEffect, useMemo, useState } from 'react';
import LightLayout from '@/components/layouts/LightLayout';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Typography, Paper, Button, Divider, List, ListItem, ListItemIcon, ListItemText,
  Radio, RadioGroup, FormControl, FormLabel, IconButton, TextField, Container, Chip,
  Collapse, Tooltip, Grid,
} from '@mui/material';
import {
  Add as AddIcon, Remove as RemoveIcon, CheckCircle as CheckCircleIcon, LocationOn as LocationIcon,
  CalendarToday as CalendarIcon, Info as InfoIcon, Share as ShareIcon, Event as CalendarAddIcon,
  ExpandMore as ExpandMoreIcon, ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { EventService } from '@/services/EventService';
import { CheckoutService } from '@/services/CheckoutService';
import type { EventDetail, Ticket } from '@/types/Event';
import Loading from '@/components/common/Loading';
import ErrorState from '@/components/common/ErrorState';
import Empty from '@/components/common/Empty';
import { formatMoneyByCountry } from '@/utils/format';
import { EventJsonLd, BreadcrumbJsonLd } from '@/components/seo';
import { isValidId } from '@/utils/validation';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tuentradaya.com';

function toICSDate(d: Date) {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}
function downloadICS(evt: EventDetail) {
  const start = new Date(evt.date);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const location = `${evt.location?.name ?? ''} ${evt.location?.address ?? ''} ${evt.location?.city ?? ''} ${evt.location?.country ?? ''}`.trim();
  const ics = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//TuEntradaYa//ES','BEGIN:VEVENT',
    `UID:${evt.id}@ticketoffice`,`DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(start)}`,`DTEND:${toICSDate(end)}`,
    `SUMMARY:${evt.title}`,`LOCATION:${location}`,`DESCRIPTION:${(evt.description || '').replace(/\n/g, '\\n')}`,
    'END:VEVENT','END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `${evt.title.replace(/\s+/g, '_')}.ics`; a.click();
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

  // Validar ID al inicio - redirigir si es inválido
  useEffect(() => {
    if (id && !isValidId(id)) {
      router.replace('/');
    }
  }, [id, router]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const eventData = await EventService.getPublicById(id as string);
        setEvent(eventData as unknown as EventDetail);
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
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })
        : '',
    [event]
  );

  const handleCheckout = async () => {
    if (!selectedTicket) return;
    try {
      const session = await CheckoutService.createSession({
        eventId: String(id),
        priceId: selectedTicketId,
        quantity,
      });
      if (session?.sessionId) {
        try {
          localStorage.setItem(
            `checkout:meta:${session.sessionId}`,
            JSON.stringify({ eventId: String(id), priceId: selectedTicketId, quantity })
          );
        } catch {}
        router.push(`/checkout/${session.sessionId}`);
      }
    } catch (e) {
      console.error('Failed to start checkout session', e);
      alert('No se pudo iniciar la compra. Inténtalo nuevamente.');
    }
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
    } catch { /* cancel */ }
  };

  if (loading) return <Loading minHeight="60vh" />;

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Empty title="Evento no encontrado" description="No pudimos encontrar el evento solicitado." />
      </Container>
    );
  }

  const canBuy = !!selectedTicket && (selectedTicket?.stock ?? 0) > 0 && quantity >= 1;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* SEO: Schema.org JSON-LD */}
      <EventJsonLd event={event} />
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: BASE_URL },
        { name: 'Eventos', url: `${BASE_URL}/events` },
        { name: event.title, url: `${BASE_URL}/events/${event.id}` },
      ]} />

      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push('/events')}
        sx={{
          mb: 2,
          mt: 2,
          p: 0,
          pt: 1,
          pb: 1,
        }}
      >
        Volver a eventos
      </Button>

      <Typography variant="h3" component="h1" gutterBottom>{event.title}</Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box mb={4}>
            <Box position="relative" sx={{ width: '100%', height: '400px', borderRadius: 2, overflow: 'hidden', mb: 3, }}>
              {event.image?.url ? (
                <Box
                  component="img"
                  src={event.image.url}
                  alt={event.image.alt || event.title}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = 'https://via.placeholder.com/800x400/6366f1/ffffff?text=Evento';
                  }}
                  sx={{
                    width: '100%',
                    height: '100%',
                  }}
                />
              ) : (
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'primary.main',
                    color: 'white',
                    fontSize: '2rem',
                    fontWeight: 'bold'
                  }}
                >
                  {event.title}
                </Box>
              )}
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
                      {event.location.latitude && event.location.longitude && (
                        <Box sx={{ mt: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            component="a"
                            href={`https://www.google.com/maps?q=${event.location.latitude},${event.location.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<LocationIcon />}
                          >
                            Ver en el mapa
                          </Button>
                        </Box>
                      )}
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
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: '12px', 
              position: 'sticky', 
              top: 20,
              backgroundColor: 'rgba(28, 28, 34, 1)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
            }}
          >
          <Typography 
            variant="h5" 
            gutterBottom
            sx={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: 'white',
              mb: 2,
            }}
          >
            Selecciona tu entrada
          </Typography>

          <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
            <FormLabel 
              component="legend"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'rgba(161, 161, 170, 1)',
                mb: 1,
              }}
            >
              Tipo de entrada
            </FormLabel>
            <RadioGroup value={selectedTicketId} onChange={(e) => setSelectedTicketId(e.target.value)}>
              {event.tickets.map((ticket) => {
                const disabled = ticket.stock <= 0;
                return (
                  <Box
                    key={ticket.id}
                    onClick={() => !disabled && setSelectedTicketId(ticket.id)}
                    sx={{
                      position: 'relative',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      opacity: disabled ? 0.6 : 1,
                      mb: 1,
                    }}
                  >
                    {selectedTicketId === ticket.id && (
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: '-2px',
                          background: 'linear-gradient(to right, rgba(139, 92, 246, 1), rgba(99, 102, 241, 1))',
                          borderRadius: '8px',
                          opacity: 1,
                          filter: 'blur(1px)',
                        }}
                      />
                    )}
                    <Paper
                      variant="outlined"
                      sx={{
                        position: 'relative',
                        p: 1.5,
                        borderRadius: '8px',
                        backgroundColor: 'rgba(28, 28, 34, 1)',
                        border: 'none',
                        '&:hover': {
                          backgroundColor: disabled ? 'rgba(28, 28, 34, 1)' : 'rgba(39, 39, 42, 0.5)',
                        },
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
                        <Box>
                          <Typography 
                            variant="subtitle1"
                            sx={{
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              color: 'white',
                            }}
                          >
                            {ticket.type}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{
                              fontSize: '0.75rem',
                              color: 'rgba(113, 113, 122, 1)',
                              mt: 0.25,
                            }}
                          >
                            {ticket.stock} entradas disponibles
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          {disabled && <Chip size="small" label="Agotado" color="error" />}
                          {ticket.isFree || ticket.value === 0 ? (
                            <Chip 
                              label="GRATIS" 
                              size="small"
                              sx={{ 
                                fontWeight: 'bold', 
                                fontSize: '0.625rem',
                                backgroundColor: 'rgba(74, 222, 128, 1)',
                                color: 'black',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                px: 1,
                                py: 0.25,
                              }} 
                            />
                          ) : (
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 600,
                                color: 'white',
                                fontSize: '1rem',
                              }}
                            >
                              {formatMoneyByCountry(ticket.value, event.location?.country)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Radio value={ticket.id} checked={selectedTicketId === ticket.id} sx={{ display: 'none' }} />
                    </Paper>
                  </Box>
                );
              })}
            </RadioGroup>
          </FormControl>

          <Box sx={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.05)', my: 3 }} />

          {/* Desglose siempre visible */}
          <Box mb={3}>
            <FormLabel 
              component="legend" 
              sx={{ 
                mb: 1, 
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'rgba(161, 161, 170, 1)',
              }}
            >
              Cantidad
            </FormLabel>
            <Box display="flex" alignItems="center" gap={1.5}>
              <IconButton 
                onClick={() => handleQuantityChange(quantity - 1)} 
                disabled={!selectedTicket || quantity <= 1}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  backgroundColor: 'rgba(39, 39, 42, 1)',
                  color: 'rgba(161, 161, 170, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(63, 63, 70, 1)',
                    color: 'white',
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(39, 39, 42, 0.5)',
                    color: 'rgba(113, 113, 122, 1)',
                  },
                }}
              >
                <RemoveIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
              <TextField
                value={quantity}
                type="number"
                disabled={!selectedTicket}
                slotProps={{ 
                  input: { 
                    inputProps: { 
                      min: 1, 
                      max: selectedTicket?.stock ?? 1, 
                      style: { textAlign: 'center' } 
                    },
                    sx: {
                      '& input': {
                        color: 'white',
                        fontWeight: 500,
                      },
                    },
                  } 
                }}
                sx={{ 
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'transparent',
                  },
                }}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              />
              <IconButton 
                onClick={() => handleQuantityChange(quantity + 1)} 
                disabled={!selectedTicket || quantity >= (selectedTicket?.stock || 1)}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  backgroundColor: 'rgba(39, 39, 42, 1)',
                  color: 'rgba(161, 161, 170, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(63, 63, 70, 1)',
                    color: 'white',
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(39, 39, 42, 0.5)',
                    color: 'rgba(113, 113, 122, 1)',
                  },
                }}
              >
                <AddIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Box>
            {selectedTicket && (
              <Typography 
                variant="caption" 
                sx={{
                  display: 'block',
                  textAlign: 'center',
                  fontSize: '0.625rem',
                  color: 'rgba(113, 113, 122, 1)',
                  mt: 1,
                }}
              >
                Máximo {selectedTicket.stock} por compra
              </Typography>
            )}
          </Box>

          <Box mb={3} sx={{ fontSize: '0.875rem' }}>
            {selectedTicket ? (
              <>
                {selectedTicket.isFree || selectedTicket.value === 0 ? (
                  <Box display="flex" justifyContent="space-between" mb={1.5} alignItems="center">
                    <Typography sx={{ color: 'rgba(161, 161, 170, 1)', fontSize: '0.875rem' }}>Precio por entrada:</Typography>
                    <Chip 
                      label="GRATIS" 
                      size="small"
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: '0.625rem',
                        backgroundColor: 'rgba(74, 222, 128, 1)',
                        color: 'black',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }} 
                    />
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="space-between" mb={1.5}>
                    <Typography sx={{ color: 'rgba(161, 161, 170, 1)', fontSize: '0.875rem' }}>Precio por entrada:</Typography>
                    <Typography sx={{ color: 'rgba(161, 161, 170, 1)', fontSize: '0.875rem' }}>{formatMoneyByCountry(selectedTicket.value, event.location?.country)}</Typography>
                  </Box>
                )}
                <Box display="flex" justifyContent="space-between" mb={1.5}>
                  <Typography sx={{ color: 'rgba(161, 161, 170, 1)', fontSize: '0.875rem' }}>Cantidad:</Typography>
                  <Typography sx={{ color: 'rgba(161, 161, 170, 1)', fontSize: '0.875rem' }}>{quantity}</Typography>
                </Box>
                <Box sx={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.05)', my: 1.5 }} />
                <Box display="flex" justifyContent="space-between" fontWeight="bold" sx={{ pt: 0.5 }}>
                  <Typography sx={{ color: 'white', fontWeight: 500, fontSize: '1rem' }}>Subtotal:</Typography>
                  <Typography sx={{ color: 'white', fontWeight: 500, fontSize: '1rem' }}>{formatMoneyByCountry(total, event.location?.country)}</Typography>
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2, color: 'rgba(113, 113, 122, 1)' }}>
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  Selecciona un tipo de entrada para continuar
                </Typography>
              </Box>
            )}
          </Box>

          {/* Desglose de tasas (solo si hay entrada seleccionada y no es gratis) */}
          {selectedTicket && !(selectedTicket.isFree || selectedTicket.value === 0) && (
            <Box mb={2}>
              <Button
                size="small"
                endIcon={<ExpandMoreIcon sx={{ transform: showBreakdown ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />}
                onClick={() => setShowBreakdown((v) => !v)}
                sx={{
                  mt: 1,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: 'rgba(161, 161, 170, 1)',
                }}
              >
                Ver desglose de tasas
              </Button>
              <Collapse in={showBreakdown}>
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography sx={{ fontSize: '0.75rem', color: 'rgba(161, 161, 170, 1)' }}>Tasas (10%):</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: 'rgba(161, 161, 170, 1)' }}>{formatMoneyByCountry(fees, event.location?.country)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" fontWeight="bold" mt={1}>
                  <Typography sx={{ fontSize: '0.875rem', color: 'white', fontWeight: 500 }}>Total:</Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: 'white', fontWeight: 500 }}>{formatMoneyByCountry(grandTotal, event.location?.country)}</Typography>
                </Box>
              </Collapse>
            </Box>
          )}

          {/* Botón de compra siempre visible */}
          <Box display="grid" gap={1.5}>
            <Tooltip title={!canBuy ? 'Selecciona una entrada disponible' : ''}>
              <span>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleCheckout}
                  startIcon={<CheckCircleIcon sx={{ fontSize: '1rem' }} />}
                  disabled={!canBuy}
                  sx={{
                    py: 1.5,
                    color: 'white',
                    fontWeight: 500,
                    textTransform: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 8px 16px rgba(139, 92, 246, 0.2)',
                    '&:hover': {filter: 'brightness(1.1)',
                    },
                    '&:disabled': {
                      background: 'rgba(63, 63, 70, 1)',
                      color: 'rgba(113, 113, 122, 1)',
                    },
                  }}
                >
                  Comprar ahora
                </Button>
              </span>
            </Tooltip>

            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1.5}>
              <Button 
                variant="outlined" 
                startIcon={<ShareIcon sx={{ fontSize: '0.875rem' }} />} 
                onClick={handleShare}
                sx={{
                  py: 1.25,
                  px: 2,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(161, 161, 170, 1)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(212, 212, 216, 1)',
                  },
                }}
              >
                Compartir
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<CalendarAddIcon sx={{ fontSize: '0.875rem' }} />} 
                onClick={() => downloadICS(event)}
                sx={{
                  py: 1.25,
                  px: 2,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(161, 161, 170, 1)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(212, 212, 216, 1)',
                  },
                }}
              >
                Agregar al calendario
              </Button>
            </Box>
          </Box>
        </Paper>

        {event.organizer && (
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
            <Typography variant="h6" gutterBottom>Organizador</Typography>
            <Box display="flex" alignItems="center">
              {event.organizer?.logoUrl && (
                <Box component="img" src={event.organizer.logoUrl} alt={event.organizer.name} sx={{ width: 60, height: 60, borderRadius: 1, objectFit: 'contain', mr: 2 }} />
              )}
              <Box>
                <Typography variant="subtitle1">{event.organizer?.name}</Typography>
                {event.organizer?.url && (
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
    <LightLayout title="Detalles del Evento - TuEntradaYa">
      <EventDetailContent />
    </LightLayout>
  );
}