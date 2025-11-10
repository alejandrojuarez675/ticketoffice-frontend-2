// src/app/admin/events/[id]/sales/page.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import Loading from '@/components/common/Loading';
import ErrorState from '@/components/common/ErrorState';
import Empty from '@/components/common/Empty';
import { SalesService } from '@/services/SalesService';
import { logger } from '@/lib/logger';

type Row = {
  id: string;
  name: string;
  email: string;
  ticketType: string;
  price: number;
  validated: boolean;
};

export default function EventSalesPage() {
  return (
    <BackofficeLayout title="Ventas del Evento">
      <EventSalesPageInner />
    </BackofficeLayout>
  );
}

function EventSalesPageInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const selectedSaleId = useRef<string | null>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        // BE real: GET /api/v1/events/{id}/sales
        const res = await SalesService.listByEvent(String(id)); // { sales: SaleLightDTO[] }
        if (!active) return;
        setRows(
          (res || []).map((s) => ({
            id: s.id,
            name: s.sellerName,
            email: s.buyerEmail,
            ticketType: 'General', // Default value since ticketType is not in SaleRecord
            price: s.unitPrice,
            validated: s.paymentStatus === 'paid',
          }))
        );
      } catch (err) {
        logger.error('sales_load_failed', err);
        if (active) setError('Error al cargar las ventas del evento');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const handleBack = () => router.push(`/admin/events/${id}`);

  const handleClick = (e: React.MouseEvent<HTMLElement>, saleId: string) => {
    setAnchorEl(e.currentTarget);
    selectedSaleId.current = saleId;
  };
  const handleClose = () => setAnchorEl(null);

  const handleValidate = () => {
    if (selectedSaleId.current) {
      router.push(`/admin/events/${id}/validate?saleId=${encodeURIComponent(selectedSaleId.current)}`);
    }
    handleClose();
  };

  const statusChip = (v: boolean) => (
    <Chip label={v ? 'Validado' : 'Pendiente'} color={v ? 'success' : 'warning'} size="small" />
  );

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
        <ErrorState message={error} onRetry={() => router.refresh()} />
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
        <Typography variant="h4">Ventas del Evento</Typography>
        <Box sx={{ flexGrow: 1 }} />
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Comprador</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Ticket</TableCell>
                      <TableCell align="right">Precio</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.id} hover>
                        <TableCell>{r.name || '—'}</TableCell>
                        <TableCell>{r.email}</TableCell>
                        <TableCell>{r.ticketType}</TableCell>
                        <TableCell align="right">
                          {r.price.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                        </TableCell>
                        <TableCell>{statusChip(r.validated)}</TableCell>
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
