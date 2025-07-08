import React from 'react';
import { useParams } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  CardHeader, 
  CardMedia, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText,
  Grid
} from '@mui/material';
import { ValidatorService } from '../../services/ValidatorService';
import { EventService } from '../../services/EventService';
import { EventDetail } from '../../types/Event';

const AdminEventTicketValidationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ticketId, setTicketId] = React.useState('');
  const [openDialog, setOpenDialog] = React.useState(false);
  const [dialogMessage, setDialogMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [event, setEvent] = React.useState<EventDetail | null>(null);
  const [eventLoading, setEventLoading] = React.useState(true);

  React.useEffect(() => {
    if (id) {
      EventService.getEventById(id)
        .then((event) => {
          setEvent(event);
          setEventLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching event:', error);
          setEventLoading(false);
        });
    }
  }, [id]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogMessage('');
    setTicketId(''); // Reset the ticket ID input
  };

  const handleValidate = async () => {
    if (!id || !ticketId) {
      setDialogMessage('Por favor ingrese un ID de ticket válido');
      setOpenDialog(true);
      return;
    }

    setIsLoading(true);
    try {
      await ValidatorService.validateTicket(id, ticketId);
      setDialogMessage('La entrada fue confirmada satisfactoriamente');
    } catch (error) {
      setDialogMessage('Error al validar la entrada, compruebe nuevamente.');
      console.error('Error validating ticket:', error);
    } finally {
      setIsLoading(false);
      setOpenDialog(true);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          {eventLoading ? (
            <Typography variant="h5" gutterBottom>
              Cargando información del evento...
            </Typography>
          ) : event ? (
            <>
              <Typography variant="h4" gutterBottom>
                Validación de Entradas
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={event.image.url}
                      alt={event.image.alt}
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <CardHeader
                      title={event.title}
                      subheader={new Date(event.date).toLocaleString()}
                    />
                  </Grid>
                </Grid>
              </Box>
              <Typography variant="body1" gutterBottom sx={{ mt: 3 }}>
                Ingrese el ID de la entrada para validarla.
              </Typography>
              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  label="ID de Entrada"
                  variant="outlined"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleValidate}
                  disabled={isLoading || !ticketId}
                  sx={{ mt: 2 }}
                >
                  {isLoading ? 'Validando...' : 'Validar Entrada'}
                </Button>
              </Box>
            </>
          ) : (
            <Typography variant="h5" gutterBottom>
              No se encontró información del evento.
            </Typography>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>{dialogMessage}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogMessage.includes('confirmada') ? (
              <Typography color="success.main">
                La entrada ha sido validada correctamente.
              </Typography>
            ) : (
              <Typography color="error.main">
                Por favor, verifique el ID de entrada e inténtelo nuevamente.
              </Typography>
            )}
          </DialogContentText>
          <Button
            onClick={handleCloseDialog}
            color="primary"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Cerrar
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AdminEventTicketValidationPage;
