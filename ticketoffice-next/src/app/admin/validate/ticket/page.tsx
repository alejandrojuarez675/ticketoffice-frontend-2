'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  CircularProgress,
  useTheme,
  useMediaQuery,
  Paper,
  Divider,
  Grid,
  Chip,
  IconButton,
  Avatar
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon, 
  Error as ErrorIcon, 
  ArrowBack as ArrowBackIcon,
  QrCodeScanner as QrCodeScannerIcon,
  EventSeat as EventSeatIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  ConfirmationNumber as TicketIcon
} from '@mui/icons-material';
import { ValidatorService } from '@/services/ValidatorService';
import { SalesService } from '@/services/SalesService';
import { EventService } from '@/services/EventService';
import { EventDetail } from '@/types/event';
import { Sale } from '@/types/sales';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TicketValidationPageProps {
  params: {
    id: string;
    saleId: string;
  };
}

const TicketValidationPage = ({ params }: TicketValidationPageProps) => {
  const { id: eventId, saleId } = params;
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, isAdmin } = useAuth();
  
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
    timestamp?: Date;
  } | null>(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  // Check authentication and fetch data
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/auth/login');
      return;
    }

    const fetchData = async () => {
      if (!eventId || !saleId) return;
      
      try {
        setLoading(true);
        setValidationError('');
        
        const [eventResponse, saleResponse] = await Promise.all([
          EventService.getEventById(eventId),
          SalesService.getInstance().getSaleById(eventId, saleId)
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

    fetchData();
  }, [eventId, saleId, isAuthenticated, isAdmin, router]);

  const handleBack = () => {
    router.push('/admin/events');
  };

  const handleOpenScanner = () => {
    setScannerOpen(true);
  };

  const handleCloseScanner = () => {
    setScannerOpen(false);
  };

  const handleScanSuccess = (ticketId: string) => {
    console.log('Scanned ticket ID:', ticketId);
    // Here you would typically validate the scanned ticket ID
    handleCloseScanner();
    handleValidateTicket();
  };

  const handleValidateTicket = async () => {
    if (!eventId || !saleId) return;
    
    try {
      setValidating(true);
      setValidationError('');
      
      // Call the validation service
      const result = await ValidatorService.getInstance().validateTicket(eventId, saleId);
      
      setValidationResult({
        isValid: result.isValid,
        message: result.message || 'Entrada validada correctamente',
        timestamp: new Date()
      });
      
      // Refresh sale data after validation
      const updatedSale = await SalesService.getInstance().getSaleById(eventId, saleId);
      setSale(updatedSale);
      
    } catch (error) {
      console.error('Error validating ticket:', error);
      setValidationError('Error al validar la entrada. Intente nuevamente.');
      setValidationResult({
        isValid: false,
        message: 'Error al validar la entrada',
        timestamp: new Date()
      });
    } finally {
      setValidating(false);
      setOpenConfirmDialog(false);
    }
  };

  const handleOpenConfirmDialog = () => {
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "EEEE d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!event || !sale) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          No se pudo cargar la información del ticket
        </Typography>
        <Typography color="textSecondary" paragraph>
          {validationError || 'La entrada solicitada no existe o no está disponible.'}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleBack}
          startIcon={<ArrowBackIcon />}
        >
          Volver a la lista de eventos
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Validar Entrada
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          color="primary"
          startIcon={<QrCodeScannerIcon />}
          onClick={handleOpenScanner}
          sx={{ mr: 1 }}
        >
          Escanear QR
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={validating ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
          onClick={handleOpenConfirmDialog}
          disabled={validating}
        >
          {validating ? 'Validando...' : 'Validar Entrada'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <TicketIcon />
                </Avatar>
                <div>
                  <Typography variant="h5" component="div">
                    Entrada para {event.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {sale.id}
                  </Typography>
                </div>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EventIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      <strong>Evento:</strong> {event.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      <strong>Lugar:</strong> {event.location || 'No especificado'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      <strong>Fecha:</strong> {formatDate(event.date.toString())}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      <strong>Comprador:</strong> {sale.customerName || 'Anónimo'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EmailIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body1" noWrap>
                      <strong>Email:</strong> {sale.customerEmail}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EventSeatIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      <strong>Entradas:</strong> {sale.ticketCount} (${sale.totalAmount.toFixed(2)})
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              {validationResult && (
                <Box 
                  sx={{
                    mt: 3,
                    p: 2,
                    borderRadius: 1,
                    bgcolor: validationResult.isValid ? 'success.light' : 'error.light',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {validationResult.isValid ? (
                    <CheckCircleIcon sx={{ mr: 1 }} />
                  ) : (
                    <ErrorIcon sx={{ mr: 1 }} />
                  )}
                  <Typography variant="body1">
                    {validationResult.message} - {format(validationResult.timestamp || new Date(), 'HH:mm:ss')}
                  </Typography>
                </Box>
              )}
              
              {validationError && (
                <Box 
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'error.light',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <ErrorIcon sx={{ mr: 1 }} />
                  <Typography variant="body1">{validationError}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
          
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detalles de la Compra
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Estado del Pago
                </Typography>
                <Chip 
                  label={sale.paymentStatus === 'completed' ? 'Pagado' : 'Pendiente'}
                  color={sale.paymentStatus === 'completed' ? 'success' : 'warning'}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Estado de la Entrada
                </Typography>
                <Chip 
                  label={sale.validated ? 'Validada' : 'No validada'}
                  color={sale.validated ? 'success' : 'default'}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Fecha de Compra
                </Typography>
                <Typography variant="body1">
                  {formatDate(sale.createdAt.toString())}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Código QR
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Box 
                  sx={{
                    p: 2,
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                    display: 'inline-block',
                    mb: 2
                  }}
                >
                  <QrCodeScannerIcon sx={{ fontSize: 100, color: 'text.secondary' }} />
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Escanee este código QR para validar la entrada
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  ID: {sale.id.substring(0, 8)}...
                </Typography>
              </Box>
            </CardContent>
          </Card>
          
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información de Validación
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Última Validación
                </Typography>
                <Typography variant="body1">
                  {sale.validatedAt 
                    ? formatDate(sale.validatedAt.toString())
                    : 'No validada aún'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Validada por
                </Typography>
                <Typography variant="body1">
                  {sale.validatedBy || 'No aplicable'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar Validación</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            ¿Está seguro de que desea validar esta entrada? Esta acción no se puede deshacer.
          </Typography>
          {sale.validated && (
            <Box 
              sx={{
                mt: 2,
                p: 1.5,
                bgcolor: 'warning.light',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ErrorIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="body2">
                Esta entrada ya fue validada anteriormente.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleValidateTicket} 
            color="primary" 
            variant="contained"
            disabled={validating}
            startIcon={validating ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {validating ? 'Validando...' : 'Confirmar Validación'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Scanner Dialog - Implementation would go here */}
      <Dialog
        open={scannerOpen}
        onClose={handleCloseScanner}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Escanear Código QR</DialogTitle>
        <DialogContent sx={{ textAlign: 'center', p: 4 }}>
          <Box 
            sx={{
              width: '100%',
              height: 300,
              bgcolor: 'black',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mb: 2,
              borderRadius: 1,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <Box 
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 200,
                height: 200,
                border: '2px solid white',
                borderRadius: 1,
                zIndex: 1
              }}
            />
            <Typography variant="body1" color="white">
              Vista previa del escáner QR
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Escanea el código QR de la entrada para validarla automáticamente.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseScanner} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={() => handleScanSuccess('mock-scanned-ticket-id')} 
            color="primary" 
            variant="contained"
          >
            Simular Escaneo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TicketValidationPage;
