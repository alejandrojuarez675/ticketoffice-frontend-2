// src/components/events/EventCard.tsx
'use client';

import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  Box,
  Chip,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import type { SearchEvent } from '@/types/search-event';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { isFavorite, toggleFavorite } from '@/utils/favorites';
import { deriveCategory } from '@/utils/eventsFilters';
import { EventService } from '@/services/EventService';
import { CheckoutService } from '@/services/CheckoutService';
import type { Ticket } from '@/types/Event';
import { formatCurrency } from '@/utils/format';

export default function EventCard({ event }: { event: SearchEvent }) {
  const router = useRouter();
  const [fav, setFav] = useState(false);
  const [openBuy, setOpenBuy] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [creatingSession, setCreatingSession] = useState(false);

  useEffect(() => {
    setFav(isFavorite(event.id));
  }, [event.id]);

  const onToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFav(toggleFavorite(event.id));
  };

  const category = useMemo(() => deriveCategory(event.name), [event.name]);
  const ageLabel = event.minAge && event.minAge >= 18 ? '+18' : 'Todas las edades';

  const dateObj = new Date(event.date);
  const dateLabel = dateObj.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeLabel = dateObj.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const storageKey = `quickbuy:${event.id}`;

  const loadPrefs = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { selectedTicketId?: string; quantity?: number };
      if (parsed.selectedTicketId) setSelectedTicketId(parsed.selectedTicketId);
      if (parsed.quantity && parsed.quantity > 0) setQuantity(parsed.quantity);
    } catch {}
  };

  const savePrefs = (next?: Partial<{ selectedTicketId: string; quantity: number }>) => {
    try {
      const data = { selectedTicketId, quantity, ...next };
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {}
  };

  const handleBuyClick = async () => {
    setOpenBuy(true);
    if (tickets.length > 0) {
      loadPrefs();
      return;
    }
    try {
      setLoadingTickets(true);
      const full = await EventService.getEventById(event.id);
      if (full?.tickets && Array.isArray(full.tickets)) {
        setTickets(full.tickets.filter((t: Ticket) => t.stock > 0));
      }
      loadPrefs();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTickets(false);
    }
  };

  return (
    <Card
      onClick={() => {
        if (openBuy) return;
        router.push(`/events/${event.id}`);
      }}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'rgba(124, 58, 237, 0.5)',
          transform: 'translateY(-2px)',
          boxShadow: '0 0 20px rgba(124, 58, 237, 0.2)',
          '& .event-image': {
            transform: 'scale(1.05)',
          },
          '& .event-title': {
            color: 'rgba(167, 139, 250, 1)',
          },
        },
      }}
    >
      <Box sx={{ position: 'relative', height: 208, overflow: 'hidden' }}>
        <Box
          className="event-image"
          component="img" 
          src={event.bannerUrl || 'https://via.placeholder.com/800x450/6366f1/ffffff?text=Evento'} 
          alt={event.name} 
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.src = 'https://via.placeholder.com/800x450/6366f1/ffffff?text=Evento';
          }}
          sx={{ 
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }} 
        />
        <Box 
          sx={{ 
            position: 'absolute',
            inset: 0,
             opacity: 0.6,
          }}
        />
        <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 1 }}>
          <Tooltip title={fav ? 'Quitar de guardados' : 'Guardar'}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFav(e);
              }}
              aria-label={fav ? 'Quitar de guardados' : 'Guardar'}
              sx={{
                padding: '8px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(12px)',
                color: 'rgba(255, 255, 255, 0.7)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                },
              }}
            >
              {fav ? <FavoriteIcon sx={{ fontSize: '1rem' }} color="error" /> : <FavoriteBorderIcon sx={{ fontSize: '1rem' }} />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.75 }} alignItems="center">
          <Chip 
            size="small" 
            label={category} 
            sx={{ 
              px: 1.25,
              py: 0.5,
              borderRadius: '9999px',
              fontSize: '0.625rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              border: '1px solid rgba(39, 39, 42, 1)',
              color: 'rgba(196, 181, 253, 1)',
            }}
          />
          <Chip 
            size="small" 
            label={ageLabel}
            sx={{ 
              px: 1.25,
              py: 0.5,
              borderRadius: '9999px',
              fontSize: '0.625rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              border: '1px solid rgba(63, 63, 70, 1)',
              color: 'rgba(161, 161, 170, 1)',
            }}
          />
          <Chip
            size="small"
            label={event.status === 'ACTIVE' ? 'Activo' : event.status === 'SOLD_OUT' ? 'Agotado' : 'Inactivo'}
            sx={{ 
              px: 1.25,
              py: 0.5,
              borderRadius: '9999px',
              fontSize: '0.625rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              border: event.status === 'ACTIVE' ? '1px solid rgba(6, 78, 59, 0.3)' : '1px solid rgba(39, 39, 42, 1)',
              color: event.status === 'ACTIVE' ? 'rgba(52, 211, 153, 1)' : 'rgba(161, 161, 170, 1)',
              backgroundColor: event.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
            }}
          />
        </Stack>

        <Typography 
          className="event-title"
          gutterBottom 
          variant="h6" 
          component="h3"
          sx={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: 'white',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            mb: 2,
            transition: 'color 0.3s ease',
          }}
        >
          {event.name}
        </Typography>

        <Box sx={{ space: 'y-2', mb: 2 }}>
          <Typography variant="body2" sx={{ color: 'rgba(161, 161, 170, 1)', fontSize: '0.875rem', mb: 0.75 }}>
            <Box component="span" sx={{ color: 'rgba(113, 113, 122, 1)', fontWeight: 500 }}>Ubicación:</Box> {event.location}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(161, 161, 170, 1)', fontSize: '0.875rem', mb: 0.75 }}>
            <Box component="span" sx={{ color: 'rgba(113, 113, 122, 1)', fontWeight: 500 }}>Fecha:</Box> {dateLabel}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(161, 161, 170, 1)', fontSize: '0.875rem' }}>
            <Box component="span" sx={{ color: 'rgba(113, 113, 122, 1)', fontWeight: 500 }}>Hora:</Box> {timeLabel}
          </Typography>
        </Box>

        <Box sx={{ pt: 2 }}>
          {event.price === 0 ? (
            <Chip 
              label="GRATIS" 
              size="medium"
              sx={{ 
                fontWeight: 'bold',
                fontSize: '0.875rem',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: 'rgba(16, 185, 129, 1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                px: 2,
                py: 0.5,
              }} 
            />
          ) : (
            <Box>
              <Typography variant="body2" sx={{ color: 'rgba(113, 113, 122, 1)', fontSize: '0.75rem', mb: 0.5, fontWeight: 500 }}>
                Desde
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'white', fontSize: '1.25rem' }}>
                {event.currency
                  ? new Intl.NumberFormat('es-AR', { 
                      style: 'currency', 
                      currency: /^[A-Z]{3}$/.test(event.currency) ? event.currency : 'ARS' 
                    }).format(event.price)
                  : `$${event.price.toLocaleString('es-AR')}`}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>

      <Box sx={{ p: 2.5, pt: 0 }}>
        <Button
          className="buyBtn"
          fullWidth
          variant="contained"
          onClick={(e) => {
            e.stopPropagation();
            handleBuyClick();
          }}
          sx={{
            mt: 2,
            color: 'white',
            fontWeight: 600,
            fontSize: '0.875rem',
            py: 1.5,
            textTransform: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 14px 0 rgba(124, 58, 237, 0.39)',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(139, 92, 246, 1)',
              boxShadow: '0 6px 20px rgba(124, 58, 237, 0.5)',
            },
          }}
        >
          Comprar ahora
        </Button>
      </Box>

      {/* Quick Buy Dialog */}
      <Dialog
        open={openBuy}
        onClose={() => {
          setOpenBuy(false);
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Comprar entradas</DialogTitle>
        <DialogContent dividers>
          {loadingTickets ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={24} />
            </Box>
          ) : tickets.length === 0 ? (
            <Typography variant="body2">No hay tipos de entradas disponibles.</Typography>
          ) : (
            <>
              {/* Tipo de Entrada */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Tipo de entrada
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={selectedTicketId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedTicketId(val);
                      setQuantity(1);
                      savePrefs({ selectedTicketId: val, quantity: 1 });
                    }}
                    displayEmpty
                  >
                    {tickets.map((t) => (
                      <MenuItem key={t.id} value={t.id} disabled={t.stock <= 0}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <Typography>{t.type}</Typography>
                          {t.stock <= 0 && <Chip label="Agotado" size="small" color="error" sx={{ ml: 1 }} />}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Precio */}
              {selectedTicketId && (() => {
                const ticket = tickets.find((t) => t.id === selectedTicketId);
                return ticket ? (
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Precio por entrada
                    </Typography>
                    {ticket.isFree || ticket.value === 0 ? (
                      <Chip 
                        label="GRATIS" 
                        color="success" 
                        size="medium"
                        sx={{ fontWeight: 'bold', fontSize: '1rem' }} 
                      />
                    ) : (
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                        {formatCurrency(ticket.value, /^[A-Z]{3}$/.test(ticket.currency) ? ticket.currency : 'ARS', 'es-AR')}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {ticket.stock} entradas disponibles
                    </Typography>
                  </Box>
                ) : null;
              })()}

              {/* Cantidad con botones +/- */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Cantidad
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton 
                    onClick={() => {
                      const newQty = Math.max(1, quantity - 1);
                      setQuantity(newQty);
                      savePrefs({ quantity: newQty });
                    }}
                    disabled={quantity <= 1}
                    sx={{ 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <TextField
                    type="number"
                    value={quantity}
                    inputProps={{
                      min: 1,
                      max: tickets.find((t) => t.id === selectedTicketId)?.stock ?? 1,
                      style: { textAlign: 'center' },
                    }}
                    onChange={(e) => {
                      const max = tickets.find((t) => t.id === selectedTicketId)?.stock ?? 1;
                      const val = Math.max(1, Math.min(parseInt(e.target.value || '1', 10), max));
                      setQuantity(val);
                      savePrefs({ quantity: val });
                    }}
                    sx={{ 
                      width: '80px',
                      '& input': { 
                        textAlign: 'center',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                      }
                    }}
                  />
                  <IconButton 
                    onClick={() => {
                      const max = tickets.find((t) => t.id === selectedTicketId)?.stock ?? 1;
                      const newQty = Math.min(max, quantity + 1);
                      setQuantity(newQty);
                      savePrefs({ quantity: newQty });
                    }}
                    disabled={quantity >= (tickets.find((t) => t.id === selectedTicketId)?.stock ?? 1)}
                    sx={{ 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* Total */}
              {selectedTicketId && (() => {
                const ticket = tickets.find((t) => t.id === selectedTicketId);
                if (!ticket || ticket.isFree || ticket.value === 0) return null;
                const total = ticket.value * quantity;
                return (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.50', borderRadius: 1, border: '1px solid', borderColor: 'primary.200' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Total
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                        {formatCurrency(total, /^[A-Z]{3}$/.test(ticket.currency) ? ticket.currency : 'ARS', 'es-AR')}
                      </Typography>
                    </Box>
                  </Box>
                );
              })()}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setOpenBuy(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={!selectedTicketId || quantity < 1 || creatingSession}
            onClick={async (e) => {
              e.stopPropagation();
              if (!selectedTicketId) return;
              try {
                setCreatingSession(true);
                const session = await CheckoutService.createSession(event.id, selectedTicketId, quantity);
                if (session?.sessionId) {
                  // Persistimos meta para reconstruir en /checkout/[sessionId]
                  try {
                    localStorage.setItem(
                      `checkout:meta:${session.sessionId}`,
                      JSON.stringify({ eventId: event.id, priceId: selectedTicketId, quantity })
                    );
                  } catch {}
                  setOpenBuy(false);
                  router.push(`/checkout/${session.sessionId}`);
                }
              } catch (err) {
                console.error(err);
                alert('No se pudo iniciar la compra. Inténtalo nuevamente.');
              } finally {
                setCreatingSession(false);
              }
            }}
          >
            {creatingSession ? 'Iniciando...' : 'Ir a pagar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
