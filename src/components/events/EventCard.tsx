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
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import type { SearchEvent } from '@/types/search-event';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { isFavorite, toggleFavorite } from '@/utils/favorites';
import { deriveCategory } from '@/utils/eventsFilters';

function statusColor(status: SearchEvent['status']) {
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
  const timeLabel = dateObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  return (
    <Card
      onClick={() => router.push(`/events/${event.id}`)}
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
            color={statusColor(event.status) as any}
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
          ${event.price.toLocaleString('es-AR')} {event.currency}
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
            router.push(`/events/${event.id}`);
          }}
          sx={{ transition: 'transform .2s ease, background-color .2s ease' }}
        >
          Comprar ahora
        </Button>
      </Box>
    </Card>
  );
}