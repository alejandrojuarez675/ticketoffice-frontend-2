import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText
} from '@mui/material';
import { ValidatorService } from '../services/ValidatorService';

const AdminEventTicketValidationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ticketId, setTicketId] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogMessage('');
    setTicketId('');
  };

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Validación de Entradas
          </Typography>
          <Typography variant="h5" gutterBottom>
            Validar Entrada
          </Typography>
          <Typography variant="body1" gutterBottom>
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
    </>
  );
};

export default AdminEventTicketValidationPage;
