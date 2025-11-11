// src/app/admin/events/[id]/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { EventService } from '@/services/EventService';
import type { EventDetail } from '@/types/Event';
import { Box, Button, Container, Typography, CircularProgress, Alert, TextField } from '@mui/material';
import Link from 'next/link';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import { useAuth } from '@/app/contexts/AuthContext';

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const isSeller = user?.role === 'seller';

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guards
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/auth/login?next=' + encodeURIComponent(`/admin/events/${id}/edit`));
      return;
    }
  }, [isLoading, isAuthenticated, id, router]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const eventData = await EventService.getEventById(id);
        if (isSeller && user && eventData.organizer?.id && eventData.organizer.id !== String(user.id)) {
          setError('No tienes permisos para editar este evento.');
          return;
        }
        if (active) setEvent(eventData);
      } catch (err) {
        setError('Error al cargar el evento');
         
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, isSeller, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    try {
      await EventService.updateEvent(id, event);
      router.replace(`/admin/events/${id}`);
    } catch (err) {
      setError('Error al actualizar el evento');
       
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!event) return;
    const { name, value } = e.target;
    setEvent((prev) => ({ ...prev!, [name]: value }));
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
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button component={Link} href="/admin/events" sx={{ mt: 2 }}>
            Volver a la lista de eventos
          </Button>
        </Container>
      </BackofficeLayout>
    );
  }

  if (!event) {
    return (
      <BackofficeLayout title="Editar Evento">
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Alert severity="warning">Evento no encontrado</Alert>
          <Button component={Link} href="/admin/events" sx={{ mt: 2 }}>
            Volver a la lista de eventos
          </Button>
        </Container>
      </BackofficeLayout>
    );
  }

  return (
    <BackofficeLayout title="Editar Evento">
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h1">
            Editar Evento
          </Typography>
          <Button component={Link} href={`/admin/events/${id}`} variant="outlined">
            Volver al detalle
          </Button>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 3 }}>
          <TextField name="title" label="Título del Evento" value={event.title || ''} onChange={handleChange} fullWidth required />

          <TextField
            name="date"
            label="Fecha y Hora"
            type="datetime-local"
            value={event.date ? new Date(event.date).toISOString().slice(0, 16) : ''}
            onChange={(e) => setEvent((prev) => ({ ...prev!, date: new Date(e.target.value).toISOString() }))}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />

          <TextField name="description" label="Descripción" value={event.description || ''} onChange={handleChange} multiline rows={4} fullWidth required />

          <Box sx={{ mt: 2 }}>
            <Button type="submit" variant="contained">
              Guardar Cambios
            </Button>
          </Box>
        </Box>
      </Container>
    </BackofficeLayout>
  );
}
