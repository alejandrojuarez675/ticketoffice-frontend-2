'use client';

import React, { useEffect, useState } from 'react';
import LightLayout from '@/components/layouts/LightLayout';
import { useParams, useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Divider, 
  List, 
  ListItem, 
  ListItemText,
  CircularProgress,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import { Check as CheckIcon, ArrowBack as ArrowBackIcon, Email as EmailIcon } from '@mui/icons-material';
import { CheckoutService } from '@/services/CheckoutService';
import { EventService } from '@/services/EventService';
import { EventDetail } from '@/types/Event';
import { SessionInfoResponse } from '@/types/checkout';
import Link from 'next/link';

function CongratsContent() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionInfoResponse | null>(null);
  const [event, setEvent] = useState<EventDetail | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!sessionId) return;

      try {
        setLoading(true);
        setError(null);
        
        // Fetch session data
        const sessionData = await CheckoutService.getSession(sessionId as string);
        setSession(sessionData);

        // Fetch event data
        const eventData = await EventService.getEventById(sessionData.eventId);
        setEvent(eventData);
      } catch (err) {
        console.error('Error:', err);
        setError('No se pudo cargar la información de la compra. Por favor, verifica el enlace o inténtalo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId]);

  const handleBackToEvents = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBackToEvents}
        >
          Volver a eventos
        </Button>
      </Box>
    );
  }

  if (!event || !session) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
        <Alert severity="warning">No se encontró la información de la compra.</Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBackToEvents}
          sx={{ mt: 2 }}
        >
          Volver a eventos
        </Button>
      </Box>
    );
  }

  // Find the selected ticket
  const selectedTicket = event.tickets.find(t => t.id === session.priceId);

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          ¡Compra exitosa!
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Gracias por tu compra. Aquí tienes los detalles de tu reserva.
        </Typography>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {event.title}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Fecha y hora
            </Typography>
            <Typography variant="body1">
              {new Date(event.date).toLocaleString('es-AR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Ubicación
            </Typography>
            <Typography variant="body1">
              {event.location.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {event.location.address}, {event.location.city}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {selectedTicket ? (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Detalles de la compra
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">
                  {selectedTicket.type} x {session.quantity}
                </Typography>
                <Typography variant="body1">
                  ${(selectedTicket.value * session.quantity).toLocaleString('es-AR')} {selectedTicket.currency}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Alert severity="warning" sx={{ mb: 2 }}>
              No se encontró la información del tipo de entrada seleccionado.
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Asistentes
          </Typography>
          <List>
            {session.buyer?.map((buyer, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText 
                    primary={`${buyer.name} ${buyer.lastName}`} 
                    secondary={
                      <>
                        <Box component="span" display="block">{buyer.email}</Box>
                        <Box component="span" display="block">
                          {buyer.documentType}: {buyer.document}
                        </Box>
                      </>
                    } 
                  />
                </ListItem>
                {index < (session.buyer?.length || 0) - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        bgcolor: 'success.light', 
        p: 2, 
        borderRadius: 1,
        mb: 4
      }}>
        <EmailIcon sx={{ mr: 2, color: 'success.dark' }} />
        <Box>
          <Typography variant="subtitle1">
            Tus entradas han sido enviadas a:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {session.mainEmail}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            También puedes encontrar un resumen de tu compra en tu correo electrónico.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={handleBackToEvents}
        >
          Volver a la página principal
        </Button>
      </Box>
    </Box>
  );
}

export default function CongratsPage() {
  return (
    <LightLayout title="¡Compra Exitosa! - TicketOffice">
      <CongratsContent />
    </LightLayout>
  );
}
