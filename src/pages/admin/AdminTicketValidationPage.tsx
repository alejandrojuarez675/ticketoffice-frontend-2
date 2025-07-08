import React from 'react';
import { useParams } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { ValidatorService } from '../../services/ValidatorService';
import { SalesService } from '../../services/SalesService';
import { EventService } from '../../services/EventService';
import { EventDetail } from '../../types/Event';
import { Sale } from '../../types/Sales';

const AdminTicketValidationPage: React.FC = () => {
  const { id: eventId, saleId } = useParams<{ id: string; saleId: string }>();
  const [event, setEvent] = React.useState<EventDetail | null>(null);
  const [sale, setSale] = React.useState<Sale | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [openConfirmDialog, setOpenConfirmDialog] = React.useState(false);
  const [validating, setValidating] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string>('');

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventResponse, saleResponse] = await Promise.all([
          EventService.getEventById(eventId || ''),
          SalesService.getSaleById(eventId || '', saleId || '')
        ]);
        setEvent(eventResponse);
        setSale(saleResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
        setValidationError('Error al cargar los datos de la entrada.');
      } finally {
        setLoading(false);
      }
    };

    if (eventId && saleId) {
      fetchData();
    }
  }, [eventId, saleId]);

  const handleValidate = async () => {
    if (!eventId || !saleId) return;

    setValidating(true);
    try {
      await ValidatorService.validateTicket(eventId, saleId);
      // Navigate back to sales list after successful validation
      window.location.href = `/admin/events/${eventId}/sales`;
    } catch (error) {
      setValidationError('Error al validar la entrada. Por favor, inténtelo nuevamente.');
      console.error('Error validating ticket:', error);
    } finally {
      setValidating(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenConfirmDialog(false);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!event || !sale) {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              No se encontraron datos de la entrada
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Validación de Entrada
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Evento:
            </Typography>
            <Typography variant="body1" gutterBottom>
              {event.title}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {new Date(event.date).toLocaleString()}
            </Typography>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Detalles de la Entrada:
            </Typography>
            <Typography variant="body1" gutterBottom>
              ID: {sale.id}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Tipo: {sale.ticketType}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Comprador: {sale.firstName} {sale.lastName}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Email: {sale.email}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Precio: ${sale.price}
            </Typography>
            <Typography 
              variant="body1" 
              gutterBottom
              color={sale.validated ? 'success.main' : 'error.main'}
            >
              Estado: {sale.validated ? 'Validada' : 'No validada'}
            </Typography>
          </Box>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenConfirmDialog(true)}
              disabled={sale.validated || validating}
            >
              Validar Entrada
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>
          Confirmar Validación
        </DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea validar esta entrada?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={handleValidate}
            color="primary"
            variant="contained"
            disabled={validating}
          >
            {validating ? 'Validando...' : 'Validar'}
          </Button>
        </DialogActions>
      </Dialog>

      {validationError && (
        <Dialog
          open={!!validationError}
          onClose={() => setValidationError('')}
        >
          <DialogTitle>Error</DialogTitle>
          <DialogContent>
            <Typography>{validationError}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setValidationError('')} color="primary">
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default AdminTicketValidationPage;
