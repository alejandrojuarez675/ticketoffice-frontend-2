import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import { EventService } from '../services/EventService';
import { EventForList } from '../types/Event';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventForList[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const handleCreateEvent = () => {
    navigate('/admin/events/new');
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>, eventId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedEvent(eventId);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedEvent(null);
  };

  const handleViewDetails = () => {
    if (selectedEvent) {
      navigate(`/admin/events/${selectedEvent}`);
    }
    handleClose();
  };

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
        <Typography variant="h4" gutterBottom>
          Eventos
        </Typography>
        <Typography variant="h5" gutterBottom>
          Gestión de Eventos
        </Typography>
        <Typography variant="body1" gutterBottom>
          Aquí podrás gestionar los eventos del sistema.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateEvent}
          style={{ marginBottom: '16px' }}
        >
          Crear Nuevo Evento
        </Button>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Ubicación</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Más</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{event.name}</TableCell>
                  <TableCell>{event.date}</TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>
                    <span style={{ 
                      color: event.status === 'ACTIVE' ? 'green' : 
                              event.status === 'SOLD_OUT' ? 'orange' : 'gray'
                    }}>
                      {event.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleClick(e, event.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedEvent === event.id}
                      onClose={handleClose}
                    >
                      <MenuItem onClick={handleViewDetails}>
                        <Typography variant="inherit">Ver Detalles</Typography>
                      </MenuItem>
                    </Menu>
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

export default EventsPage;
