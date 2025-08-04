'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, Button, TextField, Typography, Paper, 
  CircularProgress, Dialog, DialogTitle, DialogContent, 
  DialogContentText, DialogActions, IconButton, Container,
  useTheme, useMediaQuery
} from '@mui/material';
import { QrCodeScanner as QrCodeScannerIcon, CheckCircle, Error } from '@mui/icons-material';
import { ValidatorService } from '@/services/ValidatorService';
import { AuthService } from '@/services/AuthService';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';

const TicketValidationPage = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [ticketCode, setTicketCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    message: string;
    eventId?: string;
  } | null>(null);

  // Auth check
  if (typeof window !== 'undefined' && !AuthService.isAuthenticated()) {
    router.push('/auth/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketCode.trim()) return;

    setLoading(true);
    try {
      const [eventId, ticketId] = ticketCode.split('_');
      if (!eventId || !ticketId) {
        throw { message: 'Formato inválido' };
      }
      
      await ValidatorService.validateTicket(eventId, ticketId);
      setValidationResult({
        success: true,
        message: '¡Entrada validada exitosamente!',
        eventId
      });
    } catch (err) {
      setValidationResult({
        success: false,
        message: 'Error al validar la entrada. Verifica el código.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackofficeLayout title="Validar Entradas">
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 2 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ textAlign: 'center' }}>
            <QrCodeScannerIcon color="primary" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" gutterBottom>Validar Entrada</Typography>
            <Typography color="text.secondary" mb={3}>
              Ingresa el código de la entrada para validar
            </Typography>
            
            <TextField
              fullWidth
              variant="outlined"
              label="Código de entrada"
              placeholder="Ej: 123_ABC456"
              value={ticketCode}
              onChange={(e) => setTicketCode(e.target.value)}
              disabled={loading}
              helperText="Formato: IDEVENTO_IDTICKET"
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => alert('Escaner QR - Próximamente')}>
                    <QrCodeScannerIcon />
                  </IconButton>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading || !ticketCode.trim()}
              fullWidth
              sx={{ mt: 3, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Validar Entrada'}
            </Button>
          </Box>
        </Paper>
      </Container>

      <Dialog open={!!validationResult} onClose={() => setValidationResult(null)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {validationResult?.success ? (
            <><CheckCircle color="success" /> ¡Validación Exitosa!</>
          ) : (
            <><Error color="error" /> Error en la Validación</>
          )}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{validationResult?.message}</DialogContentText>
          {validationResult?.eventId && (
            <Typography variant="body2" color="text.secondary" mt={2}>
              ID del Evento: {validationResult.eventId}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setValidationResult(null)}>Cerrar</Button>
          <Button 
            onClick={() => {
              setValidationResult(null);
              setTicketCode('');
            }}
            variant="contained"
            autoFocus
          >
            Validar Otra Entrada
          </Button>
        </DialogActions>
      </Dialog>
    </BackofficeLayout>
  );
};

export default TicketValidationPage;
