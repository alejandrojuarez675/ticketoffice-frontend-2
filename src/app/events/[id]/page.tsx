'use client';

import React, { useEffect, useState } from 'react';
import LightLayout from '@/components/layouts/LightLayout';
import { useParams, useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Grid, 
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
  FormControlLabel,
  IconButton,
  TextField,
  Container,
  CircularProgress,
  Alert,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Remove as RemoveIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { EventService } from '@/services/EventService';
import type { EventDetail, Ticket } from '@/types/Event';
import Image from 'next/image';

function EventDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

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

    if (id) {
      fetchEvent();
    }
  }, [id]);

  useEffect(() => {
    if (selectedTicketId && event) {
      const ticket = event.tickets.find(t => t.id === selectedTicketId);
      setSelectedTicket(ticket || null);
    } else {
      setSelectedTicket(null);
    }
  }, [selectedTicketId, event]);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (selectedTicket?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleCheckout = () => {
    if (selectedTicket) {
      router.push(`/checkout?eventId=${id}&ticketId=${selectedTicketId}&quantity=${quantity}`);
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

  const total = selectedTicket ? selectedTicket.value * quantity : 0;
  const formattedDate = new Date(event.date).toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        {event.title}
      </Typography>
      
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box mb={4}>
            <Box 
              position="relative" 
              sx={{ 
                width: '100%', 
                height: '400px',
                borderRadius: 2,
                overflow: 'hidden',
                mb: 3
              }}
            >
              {event.image && <Image
                src={event.image.url}
                alt={event.image.alt || event.title}
                fill
                style={{ objectFit: 'cover' }}
                priority
              />}
            </Box>
            
            <Typography variant="h5" gutterBottom>Descripción</Typography>
            <Typography paragraph>{event.description}</Typography>
            
            <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>Información Adicional</Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CalendarIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Fecha y Hora" 
                  secondary={formattedDate} 
                />
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemIcon>
                  <LocationIcon color="primary" />
                </ListItemIcon>
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
                    <ListItemIcon>
                      <InfoIcon color="primary" />
                    </ListItemIcon>
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
              <RadioGroup 
                value={selectedTicketId} 
                onChange={(e) => setSelectedTicketId(e.target.value)}
              >
                {event.tickets.map((ticket) => (
                  <Paper 
                    key={ticket.id} 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: 1,
                      borderColor: selectedTicketId === ticket.id ? 'primary.main' : 'divider',
                      borderWidth: selectedTicketId === ticket.id ? 2 : 1,
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'primary.main',
                      },
                    }}
                    onClick={() => setSelectedTicketId(ticket.id)}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle1">{ticket.type}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {ticket.stock} entradas disponibles
                        </Typography>
                      </Box>
                      <Typography variant="h6">
                        {ticket.isFree ? 'Gratis' : `$${ticket.value.toLocaleString('es-AR')} ${ticket.currency}`}
                      </Typography>
                    </Box>
                    <Radio 
                      value={ticket.id} 
                      checked={selectedTicketId === ticket.id}
                      sx={{ display: 'none' }}
                    />
                  </Paper>
                ))}
              </RadioGroup>
            </FormControl>
            
            {selectedTicket && (
              <>
                <Box mb={3}>
                  <FormLabel component="legend" sx={{ mb: 1, display: 'block' }}>Cantidad</FormLabel>
                  <Box display="flex" alignItems="center">
                    <IconButton 
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <TextField
                      value={quantity}
                      type="number"
                      inputProps={{ min: 1, max: selectedTicket.stock, style: { textAlign: 'center' } }}
                      sx={{ width: '80px', mx: 1 }}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    />
                    <IconButton 
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= (selectedTicket?.stock || 1)}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Máximo {selectedTicket.stock} por compra
                  </Typography>
                </Box>
                
                <Box mb={3}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Precio por entrada:</Typography>
                    <Typography>${selectedTicket.value.toLocaleString('es-AR')} {selectedTicket.currency}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Cantidad:</Typography>
                    <Typography>{quantity}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="space-between" fontWeight="bold">
                    <Typography>Total:</Typography>
                    <Typography>${total.toLocaleString('es-AR')} {selectedTicket.currency}</Typography>
                  </Box>
                </Box>
                
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={handleCheckout}
                  startIcon={<CheckCircleIcon />}
                >
                  Comprar ahora
                </Button>
              </>
            )}
          </Paper>
          
          {event.organizer && (
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
              <Typography variant="h6" gutterBottom>Organizador</Typography>
              <Box display="flex" alignItems="center">
                {event.organizer.logoUrl && (
                  <Box 
                    component="img" 
                    src={event.organizer.logoUrl} 
                    alt={event.organizer.name}
                    sx={{ 
                      width: 60, 
                      height: 60, 
                      borderRadius: 1, 
                      objectFit: 'contain',
                      mr: 2
                    }} 
                  />
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
