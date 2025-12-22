// src/app/admin/events/[id]/validate/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CardContent,
  CircularProgress,
  Container,
  Alert,
  Card,
  CardHeader,
  Avatar,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  QrCodeScanner as QrCodeScannerIcon,
  CheckCircle,
  Error,
  Event as EventIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { AuthService } from '@/services/AuthService';
import { EventService } from '@/services/EventService';
import { SalesService } from '@/services/SalesService';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import type { EventDetail } from '@/types/Event';
import type { SaleLightDTO } from '@/services/schemas/sales';
import dynamic from 'next/dynamic';
import { useTheme, useMediaQuery } from '@mui/material';

// Importar QRScanner dinámicamente para evitar SSR
const QRScanner = dynamic(() => import('@/components/common/QRScanner'), { ssr: false });

export default function EventTicketValidationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id: eventId } = useParams<{ id: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [saleId, setSaleId] = useState(searchParams.get('saleId') || '');
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [sales, setSales] = useState<SaleLightDTO[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<{ success: boolean; message: string; saleId?: string } | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Cargar evento y ventas al montar
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.replace('/auth/login?next=' + encodeURIComponent(`/admin/events/${eventId}/validate`));
      return;
    }
    loadEventAndSales();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const loadEventAndSales = async () => {
    try {
      setEventLoading(true);
      setSalesLoading(true);
      
      const [eventData, salesData] = await Promise.all([
        EventService.getEventById(eventId),
        SalesService.listByEvent(eventId),
      ]);
      
      setEvent(eventData);
      setSales(salesData.sales || []);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setSnackbar({ open: true, message: 'No se pudo cargar la información del evento.', severity: 'error' });
    } finally {
      setEventLoading(false);
      setSalesLoading(false);
    }
  };

  /**
   * Endpoint BE: POST /api/v1/events/{eventId}/sales/{saleId}/validate
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleId.trim()) return;

    setLoading(true);
    try {
      await SalesService.validateSale(eventId, saleId.trim());
      setValidationResult({ success: true, message: '¡Entrada validada exitosamente!', saleId });
      
      // Actualizar la lista de ventas para reflejar el cambio
      setSales(prev => prev.map(s => 
        s.id === saleId.trim() ? { ...s, validated: true } : s
      ));
    } catch (err) {
      console.error('Error validando:', err);
      setValidationResult({ success: false, message: 'No se pudo validar la entrada. Verifica el código.', saleId });
    } finally {
      setLoading(false);
    }
  };

  const handleValidateFromTable = async (sale: SaleLightDTO) => {
    if (sale.validated) {
      setSnackbar({ open: true, message: 'Esta entrada ya fue validada anteriormente.', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      await SalesService.validateSale(eventId, sale.id);
      setSnackbar({ open: true, message: `Entrada de ${sale.firstName} ${sale.lastName} validada exitosamente.`, severity: 'success' });
      
      // Actualizar la lista
      setSales(prev => prev.map(s => 
        s.id === sale.id ? { ...s, validated: true } : s
      ));
    } catch (err) {
      console.error('Error validando:', err);
      setSnackbar({ open: true, message: 'No se pudo validar la entrada.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => router.push(`/admin/events/${eventId}`);

  // Estadísticas rápidas
  const totalSales = sales.length;
  const validatedCount = sales.filter(s => s.validated).length;
  const pendingCount = totalSales - validatedCount;

  if (eventLoading) {
    return (
      <BackofficeLayout title="Validar Entrada">
        <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Cargando información del evento...</Typography>
        </Container>
      </BackofficeLayout>
    );
  }

  if (!event) {
    return (
      <BackofficeLayout title="Evento no encontrado">
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Alert severity="error">No se pudo cargar la información del evento. Por favor, inténtalo de nuevo.</Alert>
          <Button onClick={handleBack} startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
            Volver
          </Button>
        </Container>
      </BackofficeLayout>
    );
  }

  return (
    <BackofficeLayout title={`Validar Entradas - ${event.title}`}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Header con info del evento */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
          <IconButton onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
          <Card sx={{ flexGrow: 1 }}>
            <CardHeader
              avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><EventIcon /></Avatar>}
              title={event.title}
              subheader={new Date(event.date).toLocaleString('es-AR')}
              action={
                <IconButton onClick={loadEventAndSales} title="Recargar">
                  <RefreshIcon />
                </IconButton>
              }
            />
          </Card>
        </Box>

        {/* Estadísticas */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Chip label={`Total: ${totalSales}`} color="default" />
          <Chip label={`Validadas: ${validatedCount}`} color="success" />
          <Chip label={`Pendientes: ${pendingCount}`} color="warning" />
        </Box>

        {/* Formulario de validación manual */}
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ textAlign: 'center' }}>
            <QrCodeScannerIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Validar Entrada
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Ingresa el ID de la venta (saleId) o escanea el código QR
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, maxWidth: 500, mx: 'auto', mb: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                label="ID de venta"
                placeholder="Ej: 123e4567-e89b-12d3-a456-426614174000"
                value={saleId}
                onChange={(e) => setSaleId(e.target.value)}
                disabled={loading}
                autoFocus
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || !saleId.trim()}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
              >
                Validar
              </Button>
            </Box>

            <Button
              variant="outlined"
              size="large"
              startIcon={<QrCodeScannerIcon />}
              onClick={() => setShowQRScanner(true)}
              fullWidth
              sx={{ maxWidth: 500, mx: 'auto' }}
            >
              Escanear código QR
            </Button>
          </Box>
        </Paper>

        {/* Lista de ventas */}
        <Typography variant="h6" gutterBottom>
          Lista de ventas del evento
        </Typography>
        
        {salesLoading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : sales.length === 0 ? (
          <Alert severity="info">No hay ventas registradas para este evento.</Alert>
        ) : isMobile ? (
          // Vista móvil: Cards
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sales.map((sale) => (
              <Card key={sale.id} variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                        {sale.firstName} {sale.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                        {sale.email}
                      </Typography>
                    </Box>
                    <Chip
                      label={sale.validated ? 'Validada' : 'Pendiente'}
                      color={sale.validated ? 'success' : 'warning'}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Tipo:</Typography>
                      <Typography variant="body2" fontWeight="medium">{sale.ticketType}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Precio:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {sale.price.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    fullWidth
                    variant={sale.validated ? 'outlined' : 'contained'}
                    disabled={sale.validated || loading}
                    onClick={() => handleValidateFromTable(sale)}
                  >
                    {sale.validated ? 'Ya validada' : 'Validar'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          // Vista desktop: Tabla
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Comprador</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="right">Precio</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id} hover>
                    <TableCell>{sale.firstName} {sale.lastName}</TableCell>
                    <TableCell>{sale.email}</TableCell>
                    <TableCell>{sale.ticketType}</TableCell>
                    <TableCell align="right">
                      {sale.price.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={sale.validated ? 'Validada' : 'Pendiente'}
                        color={sale.validated ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant={sale.validated ? 'outlined' : 'contained'}
                        disabled={sale.validated || loading}
                        onClick={() => handleValidateFromTable(sale)}
                      >
                        {sale.validated ? 'Ya validada' : 'Validar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

      {/* Dialog de resultado */}
      <Dialog open={!!validationResult} onClose={() => setValidationResult(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: validationResult?.success ? 'success.main' : 'error.main' }}>
          {validationResult?.success ? (
            <>
              <CheckCircle color="success" /> <span>¡Entrada válida!</span>
            </>
          ) : (
            <>
              <Error color="error" /> <span>Validación fallida</span>
            </>
          )}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{validationResult?.message}</DialogContentText>
          {validationResult?.saleId && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                ID: <strong>{validationResult.saleId}</strong>
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setValidationResult(null);
              setSaleId('');
            }}
            variant="contained"
          >
            Validar otra
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Scanner de QR */}
      {showQRScanner && (
        <QRScanner
          onScan={(scannedSaleId) => {
            setShowQRScanner(false);
            setSaleId(scannedSaleId);
            // Auto-validar después de escanear
            setTimeout(() => {
              const form = document.querySelector('form');
              if (form) {
                form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
              }
            }, 100);
          }}
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </BackofficeLayout>
  );
}
