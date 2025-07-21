import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Paper, 
  Box, 
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  IconButton,
  TextField,
} from '@mui/material';
import { CheckoutService } from '../../services/CheckoutService';
import { EventService } from '../../services/EventService';
import { EventDetail, Ticket } from '../../types/Event';
import { 
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
  Remove as RemoveIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const event = await EventService.getEventById(id!);
        setEvent(event);
      } catch (err) {
        setError('Error al cargar los detalles del evento');
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  const handleBuyTicket = () => {
    if (!selectedTicketId || !selectedTicket) return;

    CheckoutService.createSession(id!, selectedTicketId, quantity)
    .then(session => {
      navigate(`/purchase/${session.sessionId}`);
    })
    .catch(error => {
      console.error('Error creating checkout session:', error);
      setError('Error al crear la sesión de compra');
    });
  };

  const handleTicketSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ticketId = e.target.value;
    setSelectedTicketId(ticketId);
    if (event) {
      const ticket = event.tickets.find((t: Ticket) => t.id === ticketId) || null;
      setSelectedTicket(ticket);
      // Reset quantity when changing ticket type
      setQuantity(1);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1 || (selectedTicket && newQuantity > (selectedTicket.stock < 5 ? selectedTicket.stock : 5))) return;
    setQuantity(newQuantity);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5">Cargando detalles del evento...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  if (!event) {
    return <div>No se encontró el evento</div>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Main Content Column */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                {/* Event Header */}
                <Grid item xs={12}>
                  <Typography variant="h4" gutterBottom>
                    {event.title}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    {new Date(event.date).toLocaleDateString('es-CO', { 
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Grid>

                {/* Location */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Ubicación
                    </Typography>
                    <Typography variant="body1">
                      {event.location.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.location.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.location.city}, {event.location.country}
                    </Typography>
                  </Paper>
                </Grid>

                {/* Event Image */}
                <Grid item xs={12}>
                  <img 
                    src={event.image.url} 
                    alt={event.image.alt} 
                    style={{ width: '100%', height: 'auto', borderRadius: '8px' }} 
                  />
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <Typography variant="body1" paragraph>
                    {event.description}
                  </Typography>
                </Grid>

                {/* Additional Info */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Información Adicional
                  </Typography>
                  <List>
                    {event.additionalInfo.map((info, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <ArrowForwardIcon />
                        </ListItemIcon>
                        <ListItemText primary={info} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                {/* Organizer */}
                {event.organizer && <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Organizador
                    </Typography>
                    <Typography variant="body1">
                      {event.organizer.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <a href={event.organizer.url} target="_blank" rel="noopener noreferrer">
                        Visitar sitio web
                      </a>
                    </Typography>
                  </Paper>
                </Grid> }
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Ticket Purchase Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', height: '100%' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>
                Comprar Entrada
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ mb: 2 }}>Selecciona tu entrada</FormLabel>
                <RadioGroup 
                  aria-label="ticket-type" 
                  name="ticket-type"
                  value={selectedTicketId}
                  onChange={handleTicketSelect}
                >
                  {event.tickets.map((ticket) => (
                    <Paper 
                      key={ticket.id} 
                      sx={{ 
                        p: 2, 
                        mb: 2,
                        border: selectedTicketId === ticket.id ? '2px solid #1976d2' : '1px solid rgba(0, 0, 0, 0.12)',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: 'rgba(25, 118, 210, 0.5)'
                        }
                      }}
                      onClick={() => setSelectedTicketId(ticket.id)}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item>
                          <Radio
                            value={ticket.id}
                            checked={selectedTicketId === ticket.id}
                            onChange={handleTicketSelect}
                          />
                        </Grid>
                        <Grid item xs>
                          <Typography variant="subtitle1">
                            {ticket.type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Stock: {ticket.stock > 0 ? ticket.stock : 'Agotado'}
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Typography variant="h6">
                            {ticket.currency} {ticket.value.toLocaleString()}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </RadioGroup>
              </FormControl>
              {selectedTicket && (
                <Box sx={{ mt: 3, mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Cantidad de entradas
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton 
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      size="small"
                    >
                      <RemoveIcon />
                    </IconButton>
                    <TextField
                      value={quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value)) {
                          handleQuantityChange(value);
                        }
                      }}
                      type="number"
                      inputProps={{ 
                        min: 1, 
                        max: selectedTicket?.stock || 1,
                        style: { textAlign: 'center', width: '60px' }
                      }}
                      variant="outlined"
                      size="small"
                      sx={{ mx: 1 }}
                    />
                    <IconButton 
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={!selectedTicket || quantity >= selectedTicket.stock}
                      size="small"
                    >
                      <AddIcon />
                    </IconButton>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      Máx. {(selectedTicket?.stock < 5 ? selectedTicket.stock : 5)} por compra
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Total:</Typography>
                    <Typography variant="h6">
                      {selectedTicket.currency} {(selectedTicket.value * quantity).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              )}
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleBuyTicket}
                disabled={!selectedTicketId}
                fullWidth
                size="large"
                sx={{ mt: 1 }}
              >
                {selectedTicket ? `Comprar ${quantity} entrada${quantity > 1 ? 's' : ''} ahora` : 'Selecciona un tipo de entrada'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EventDetailPage;
