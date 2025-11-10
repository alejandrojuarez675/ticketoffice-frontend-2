// src/components/events/EventCard.tsx
'use client';

import {
  Card,
  CardContent,
  CardMedia,
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
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
} from '@mui/material';
import type { ChipProps } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import type { SearchEvent } from '@/types/search-event';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { isFavorite, toggleFavorite } from '@/utils/favorites';
import { deriveCategory } from '@/utils/eventsFilters';
import { EventService } from '@/services/EventService';
import { CheckoutService } from '@/services/CheckoutService';
import type { Ticket } from '@/types/Event';
import { formatCurrency } from '@/utils/format';

function statusColor(status: SearchEvent['status']): ChipProps['color'] {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'SOLD_OUT':
      return 'warning';
    case 'INACTIVE':
    default:
      return 'default';
  }
}

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
        transition: 'transform .2s ease, box-shadow .2s ease, border-color .2s ease',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 6,
          borderColor: 'primary.main',
        },
        '&:hover .buyBtn': {
          transform: 'scale(1.03)',
          backgroundColor: 'primary.dark',
        },
      }}
    >
      <CardMedia component="img" height="180" image={event.bannerUrl} alt={event.name} sx={{ objectFit: 'cover' }} />

      <CardContent sx={{ flexGrow: 1, pt: 2 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }} alignItems="center">
          <Chip size="small" label={category} color="primary" variant="outlined" />
          <Chip size="small" label={ageLabel} variant="outlined" />
          <Chip
            size="small"
            label={event.status === 'ACTIVE' ? 'Activo' : event.status === 'SOLD_OUT' ? 'Agotado' : 'Inactivo'}
            color={statusColor(event.status)}
          />
        </Stack>

        <Typography gutterBottom variant="h6" component="h3">
          {event.name}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          <strong>Ubicación:</strong> {event.location}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Fecha:</strong> {dateLabel}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Hora:</strong> {timeLabel}
        </Typography>

        <Typography variant="subtitle1" color="primary" sx={{ mt: 1.5 }}>
          {formatCurrency(event.price, /^[A-Z]{3}$/.test(event.currency) ? event.currency : 'ARS', 'es-AR')}
        </Typography>
      </CardContent>

      <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
        <Tooltip title={fav ? 'Quitar de guardados' : 'Guardar'}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFav(e);
            }}
            aria-label={fav ? 'Quitar de guardados' : 'Guardar'}
          >
            {fav ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon sx={{ color: 'white' }} />}
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          className="buyBtn"
          fullWidth
          variant="contained"
          onClick={(e) => {
            e.stopPropagation();
            setOpenBuy(true);
            setLoadingTickets(true);
            loadPrefs();
            // Usar endpoint público (no requiere auth)
            EventService.getPublicById(event.id)
              .then((evt) => {
                setTickets(evt.tickets || []);
                if (!selectedTicketId) {
                  const firstAvailable = (evt.tickets || []).find((t) => t.stock > 0);
                  if (firstAvailable) setSelectedTicketId(firstAvailable.id);
                }
              })
              .finally(() => setLoadingTickets(false));
          }}
          sx={{ transition: 'transform .2s ease, background-color .2s ease' }}
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
              <FormControl fullWidth margin="normal">
                <InputLabel id="ticket-type-label">Tipo de entrada</InputLabel>
                <Select
                  labelId="ticket-type-label"
                  label="Tipo de entrada"
                  value={selectedTicketId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedTicketId(val);
                    savePrefs({ selectedTicketId: val });
                  }}
                >
                  {tickets.map((t) => (
                    <MenuItem key={t.id} value={t.id} disabled={t.stock <= 0}>
                      {t.type}{' '}
                      {t.isFree ? '(Gratis)' : `- ${formatCurrency(t.value, /^[A-Z]{3}$/.test(t.currency) ? t.currency : 'ARS', 'es-AR')}`}{' '}
                      {t.stock <= 0 ? ' - Agotado' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                type="number"
                fullWidth
                label="Cantidad"
                margin="normal"
                value={quantity}
                inputProps={{
                  min: 1,
                  max: tickets.find((t) => t.id === selectedTicketId)?.stock ?? 1,
                }}
                helperText={(() => {
                  const stock = tickets.find((t) => t.id === selectedTicketId)?.stock ?? 0;
                  return stock > 0 ? `Disponibles: ${stock}` : 'Sin stock disponible';
                })()}
                onChange={(e) => {
                  const max = tickets.find((t) => t.id === selectedTicketId)?.stock ?? 1;
                  const val = Math.max(1, Math.min(parseInt(e.target.value || '1', 10), max));
                  setQuantity(val);
                  savePrefs({ quantity: val });
                }}
              />
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
