'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EventService } from '@/services/EventService';
import { EventDetail } from '@/types/Event';
import { Box, Button, Container, Typography, CircularProgress, Alert, TextField } from '@mui/material';
import Link from 'next/link';
import { AuthService } from '@/services/AuthService';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';

function EditEventContent({ id }: { id: string }) {
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
        router.push('/auth/login');
        return;
      }
      
      if (!AuthService.isAdmin()) {
        router.push('/');
        return;
      }

    const fetchEvent = async () => {
      try {
        const eventData = await EventService.getEventById(id);
        setEvent(eventData);
      } catch (err) {
        setError('Error al cargar el evento');
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    try {
      await EventService.updateEvent(id, event);
      router.push(`/admin/events/${id}`);
    } catch (err) {
      setError('Error al actualizar el evento');
      console.error('Error updating event:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!event) return;
    const { name, value } = e.target;
    setEvent(prev => ({
      ...prev!,
      [name]: value
    }));
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
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button component={Link} href="/admin/events" sx={{ mt: 2 }}>
          Volver a la lista de eventos
        </Button>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">Evento no encontrado</Alert>
        <Button component={Link} href="/admin/events" sx={{ mt: 2 }}>
          Volver a la lista de eventos
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" component="h1">
          Editar Evento
        </Typography>
        <Button
          component={Link}
          href={`/admin/events/${id}`}
          variant="outlined"
          color="primary"
        >
          Volver al detalle
        </Button>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 3 }}>
        <TextField
          name="title"
          label="Título del Evento"
          value={event.title || ''}
          onChange={handleChange}
          fullWidth
          required
        />

        <TextField
          name="date"
          label="Fecha y Hora"
          type="datetime-local"
          value={event.date ? new Date(event.date).toISOString().slice(0, 16) : ''}
          onChange={(e) => {
            const date = new Date(e.target.value);
            setEvent(prev => ({
              ...prev!,
              date: date.toISOString()
            }));
          }}
          fullWidth
          required
          InputLabelProps={{
            shrink: true,
          }}
        />

        <TextField
          name="description"
          label="Descripción"
          value={event.description || ''}
          onChange={handleChange}
          multiline
          rows={4}
          fullWidth
          required
        />

        <Box sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" color="primary">
            Guardar Cambios
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default function EditEventPage({ params }: { params: { id: string } }) {
  return (
    <BackofficeLayout title="Editar Evento">
      <EditEventContent id={params.id} />
    </BackofficeLayout>
  );
}
