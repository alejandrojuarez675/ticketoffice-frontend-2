'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  IconButton,
  Menu,
  MenuItem,
  Box,
  CircularProgress,
  Button,
  useTheme,
  useMediaQuery,
  Chip
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { SalesService } from '@/services/SalesService';
import { SalesResponse, Sale } from '@/types/sales';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const EventSalesPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, isAdmin } = useAuth();
  
  const [salesData, setSalesData] = useState<SalesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const selectedSaleId = useRef<string | null>(null);
  const open = Boolean(anchorEl);

  // Check authentication and admin status
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/auth/login');
      return;
    }

    const fetchSales = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const sales = await SalesService.getEventSales(id as string);
        setSalesData(sales);
      } catch (err) {
        console.error('Error fetching sales:', err);
        setError('Error al cargar las ventas del evento');
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [id, isAuthenticated, isAdmin, router]);

  const handleBack = () => {
    router.push(`/admin/events/${id}`);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>, saleId: string) => {
    setAnchorEl(event.currentTarget);
    selectedSaleId.current = saleId;
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleValidate = () => {
    if (selectedSaleId.current && id) {
      router.push(`/admin/events/${id}/sales/${selectedSaleId.current}/validate`);
    }
    handleClose();
  };

  const handleViewDetails = () => {
    if (selectedSaleId.current && id) {
      router.push(`/admin/sales/${selectedSaleId.current}`);
    }
    handleClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button 
          variant="outlined" 
          onClick={handleBack}
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Volver al evento
        </Button>
      </Box>
    );
  }

  if (!salesData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">No se encontraron datos de ventas</Typography>
        <Button 
          variant="outlined" 
          onClick={handleBack}
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Volver al evento
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
          Ventas del Evento
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Lista de Ventas</Typography>
                <Typography variant="subtitle1">
                  Total: {salesData.total} venta{salesData.total !== 1 ? 's' : ''}
                </Typography>
              </Box>
              
              <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Comprador</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesData.data.map((sale) => (
                      <TableRow key={sale.id} hover>
                        <TableCell>
                          <Typography variant="body2" noWrap>
                            {sale.id.substring(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {sale.customerName || 'Anónimo'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {sale.customerEmail}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{sale.ticketCount}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(sale.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={sale.status} 
                            color={getStatusColor(sale.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {format(new Date(sale.createdAt), 'dd/MM/yyyy')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(sale.createdAt), 'HH:mm')}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={(e) => handleClick(e, sale.id)}
                            aria-label="more"
                            aria-controls="sale-actions-menu"
                            aria-haspopup="true"
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumen de Ventas
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Total Recaudado" 
                    secondary={formatCurrency(salesData.totalAmount || 0)}
                    secondaryTypographyProps={{ variant: 'h6', color: 'primary' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Ventas Totales" 
                    secondary={salesData.total || 0}
                    secondaryTypographyProps={{ variant: 'h6' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Entradas Vendidas" 
                    secondary={salesData.totalTickets || 0}
                    secondaryTypographyProps={{ variant: 'h6' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Filtros
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="Todas" color="primary" variant="outlined" />
                <Chip label="Completadas" variant="outlined" />
                <Chip label="Pendientes" variant="outlined" />
                <Chip label="Canceladas" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions Menu */}
      <Menu
        id="sale-actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleViewDetails}>Ver Detalles</MenuItem>
        <MenuItem onClick={handleValidate}>Validar Entrada</MenuItem>
        <MenuItem onClick={handleClose}>Descargar Comprobante</MenuItem>
      </Menu>
    </Box>
  );
};

export default EventSalesPage;
