import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { EventService } from '../services/EventService';
import { Event } from '../types/Event';

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await EventService.getMockEvents();
        setEvents(response.events);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Cargando eventos...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Gestión de Eventos
        </Typography>
        <Typography variant="body1" gutterBottom>
          Aquí podrás gestionar los eventos del sistema.
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Ubicación</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{event.name}</TableCell>
                  <TableCell>{event.date.toLocaleDateString('es-CO', { 
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>{event.price.toLocaleString('es-CO', { style: 'currency', currency: event.currency })}</TableCell>
                  <TableCell>
                    <span style={{ 
                      color: event.status === 'ACTIVE' ? 'green' : 
                              event.status === 'SOLD_OUT' ? 'orange' : 'gray'
                    }}>
                      {event.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default Events;
