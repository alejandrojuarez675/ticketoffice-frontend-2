'use client';

import React from 'react';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { SalesService, type SalesFilters, type SaleRecord } from '@/services/SalesService';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';

export default function ReportsPage() {
  const { can } = usePermissions();
  const { isAdmin, user } = useAuth();

  const [filters, setFilters] = React.useState<SalesFilters>(() => {
    const today = new Date();
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const start = new Date(today);
    start.setDate(today.getDate() - 7);
    return {
      from: iso(start),
      to: iso(today),
      sellerId: isAdmin ? undefined : String(user?.id || 'me'), // scope por rol
      query: '',
    };
  });

  const [rows, setRows] = React.useState<SaleRecord[]>([]);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await SalesService.list(filters);
      setRows(data);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    load();
  }, [load]);

  // Menú de acciones por fila (fix al bug de los "tres puntos")
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [rowId, setRowId] = React.useState<string | null>(null);
  const openMenu = (e: React.MouseEvent<HTMLElement>, id: string) => {
    setAnchorEl(e.currentTarget);
    setRowId(id);
  };
  const closeMenu = () => {
    setAnchorEl(null);
    setRowId(null);
  };

  const downloadCSV = () => {
    const csv = SalesService.toCSV(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const from = filters.from || 'all';
    const to = filters.to || 'all';
    a.download = `ventas_${from}_a_${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Mock de sellers y eventos mientras el BE no está listo
  const mockSellers = [
    { id: 'v1', name: 'Vendedor Uno' },
    { id: 'v2', name: 'Vendedor Dos' },
  ];
  const mockEvents = [
    { id: 'e1', name: 'Concierto Central' },
    { id: 'e2', name: 'Festival Playa' },
  ];

  return (
    <BackofficeLayout title="Reportes de ventas">
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {isAdmin && (
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  select
                  fullWidth
                  label="Vendedor"
                  value={filters.sellerId || ''}
                  onChange={(e) => setFilters((f) => ({ ...f, sellerId: e.target.value || undefined }))}
                  SelectProps={{ native: true }}
                >
                  <option value="">Todos</option>
                  {mockSellers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </TextField>
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                select
                fullWidth
                label="Evento"
                value={filters.eventId || ''}
                onChange={(e) => setFilters((f) => ({ ...f, eventId: e.target.value || undefined }))}
                SelectProps={{ native: true }}
              >
                <option value="">Todos</option>
                {mockEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Desde"
                type="date"
                value={filters.from || ''}
                onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value || undefined }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Hasta"
                type="date"
                value={filters.to || ''}
                onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value || undefined }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Buscar"
                placeholder="Evento, comprador, cupón, código vendedor, orden..."
                value={filters.query || ''}
                onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value || undefined }))}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size="grow" />

            <Grid size={{ xs: 12, sm: 'auto' }}>
              <Button variant="outlined" onClick={load} disabled={loading}>
                Aplicar filtros
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 'auto' }}>
              <Button
                startIcon={<FileDownloadIcon />}
                variant="contained"
                onClick={downloadCSV}
                disabled={!(can('sales.read_all') || can('sales.read_self')) || rows.length === 0 || loading}
              >
                Descargar CSV
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" alignItems="center" justifyContent="center" minHeight="40vh">
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Evento</TableCell>
                    <TableCell>Vendedor</TableCell>
                    <TableCell>Comprador</TableCell>
                    <TableCell align="right">Cant.</TableCell>
                    <TableCell align="right">P. Unit.</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Cupón</TableCell>
                    <TableCell>Cod. vendedor</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell>{new Date(r.date).toLocaleString()}</TableCell>
                      <TableCell>{r.eventName}</TableCell>
                      <TableCell>{r.sellerName}</TableCell>
                      <TableCell>{r.buyerEmail}</TableCell>
                      <TableCell align="right">{r.quantity}</TableCell>
                      <TableCell align="right">${r.unitPrice.toFixed(2)}</TableCell>
                      <TableCell align="right">${r.total.toFixed(2)}</TableCell>
                      <TableCell>{r.couponCode || '-'}</TableCell>
                      <TableCell>{r.vendorCode || '-'}</TableCell>
                      <TableCell>{r.paymentStatus}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={(e) => openMenu(e, r.id)}>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={11} align="center">
                        Sin resultados para los filtros aplicados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={closeMenu}>
                <MenuItem
                  onClick={() => {
                    // Navegación a detalle de orden (pendiente)
                    closeMenu();
                  }}
                >
                  Ver orden
                </MenuItem>
                <MenuItem disabled onClick={closeMenu}>
                  Descargar comprobante
                </MenuItem>
                <MenuItem disabled onClick={closeMenu}>
                  Reembolsar
                </MenuItem>
              </Menu>
            </>
          )}
        </CardContent>
      </Card>
    </BackofficeLayout>
  );
}