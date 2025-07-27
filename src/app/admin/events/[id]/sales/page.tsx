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
  Chip,
  Grid,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { SalesService } from '@/services/SalesService';
import { SalesResponse } from '@/types/Sales';
import { AuthService } from '@/services/AuthService';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';

const EventSalesPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [salesData, setSalesData] = useState<SalesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const selectedSaleId = useRef<string | null>(null);
  const open = Boolean(anchorEl);

  // Check authentication and admin status
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    
    if (!AuthService.isAdmin()) {
      router.push('/');
      return;
    }

    const fetchSales = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const sales = await SalesService.getInstance().getEventSales(id as string);
        setSalesData(sales);
      } catch (err) {
        console.error('Error fetching sales:', err);
        setError('Error al cargar las ventas del evento');
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [id, router]);

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
      router.push(`/admin/validate/${selectedSaleId.current}`);
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
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>              
              <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Comprador</TableCell>
                      <TableCell>Tipo de entrada</TableCell>
                      <TableCell align="right">Precio</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesData.sales.map((sale) => (
                      <TableRow key={sale.id} hover>
                        <TableCell>
                          <Typography variant="body2">
                            {sale.firstName + ' ' + sale.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {sale.email}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{sale.ticketType}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(sale.price)}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={sale.validated ? 'Validada' : 'No validada'} 
                            color={sale.validated ? 'success' : 'error'}
                            size="small"
                          />
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
        
        <Grid size={{ xs: 12, md: 4 }}>
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
        <MenuItem onClick={handleValidate}>Validar Entrada</MenuItem>
      </Menu>
    </Box>
  );
};

export default function EventSalesPageWrapper() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <BackofficeLayout title="Ventas del Evento">
      <EventSalesPage />
    </BackofficeLayout>
  );
}
