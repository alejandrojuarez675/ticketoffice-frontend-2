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
  Button,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import { formatCurrency } from '@/utils/format';
import { SalesService, type SaleRecord } from '@/services/SalesService';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';
import Loading from '@/components/common/Loading';
import ErrorState from '@/components/common/ErrorState';
import Empty from '@/components/common/Empty';

function EventSalesPageInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  const [rows, setRows] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const selectedSaleId = useRef<string | null>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/auth/login?next=' + encodeURIComponent(`/admin/events/${id}/sales`));
      return;
    }
    if (!isAdmin) {
      router.replace('/');
      return;
    }

    let active = true;
    (async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await SalesService.list({ eventId: String(id) });
        if (!active) return;
        setRows(data);
      } catch (err) {
        logger.error('Error al cargar las ventas del evento', err);
        if (active) setError('Error al cargar las ventas del evento');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id, isAuthenticated, isAdmin, isLoading, router]);

  const handleBack = () => {
    router.push(`/admin/events/${id}`);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>, saleId: string) => {
    setAnchorEl(event.currentTarget);
    selectedSaleId.current = saleId;
  };

  const handleClose = () => setAnchorEl(null);

  const handleValidate = () => {
    if (selectedSaleId.current) {
      router.push(`/admin/validate/${selectedSaleId.current}`);
    }
    handleClose();
  };

  const formatARS = (amount: number) => formatCurrency(amount, 'ARS', 'es-AR');

  const statusLabel = (s: SaleRecord['paymentStatus']) => {
    switch (s) {
      case 'paid':
        return 'Pagado';
      case 'pending':
        return 'Pendiente';
      case 'refunded':
        return 'Reembolsado';
      case 'failed':
        return 'Fallido';
      default:
        return s;
    }
  };

  const statusColor = (s: SaleRecord['paymentStatus']): 'success' | 'warning' | 'error' | 'default' => {
    switch (s) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'refunded':
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Loading label="Cargando ventas..." minHeight="60vh" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <ErrorState message={error} onRetry={() => { setError(null); router.refresh(); }} />
        <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
          Volver al evento
        </Button>
      </Box>
    );
  }

  if (!rows.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Empty title="Sin ventas" description="No se encontraron ventas para este evento." />
        <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
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
                      <TableCell align="right">Cant.</TableCell>
                      <TableCell align="right">P. Unit.</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.id} hover>
                        <TableCell>
                          <Typography variant="body2">{r.buyerEmail}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Orden: {r.orderId}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{r.quantity}</TableCell>
                        <TableCell align="right">{formatARS(r.unitPrice)}</TableCell>
                        <TableCell align="right">{formatARS(r.total)}</TableCell>
                        <TableCell>
                          <Chip label={statusLabel(r.paymentStatus)} color={statusColor(r.paymentStatus)} size="small" />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={(e) => handleClick(e, r.id)}
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
                <Chip label="Pagadas" variant="outlined" />
                <Chip label="Pendientes" variant="outlined" />
                <Chip label="Reembolsadas" variant="outlined" />
                <Chip label="Fallidas" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Menu
        id="sale-actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleValidate}>Validar Entrada</MenuItem>
      </Menu>
    </Box>
  );
}

export default function EventSalesPage() {
  return (
    <BackofficeLayout title="Ventas del Evento">
      <EventSalesPageInner />
    </BackofficeLayout>
  );
}