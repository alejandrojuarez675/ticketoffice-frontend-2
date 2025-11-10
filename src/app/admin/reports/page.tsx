// src/app/admin/reports/page.tsx
'use client';

import React from 'react';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import {
  Box, Card, CardContent, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody,
  CircularProgress, InputAdornment, Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { SalesService } from '@/services/SalesService';

type Row = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  ticketType: string;
  price: number;
  validated: boolean;
};

export default function ReportsPage() {
  const [eventId, setEventId] = React.useState<string>('');
  const [query, setQuery] = React.useState<string>('');
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);

  const load = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const sales = await SalesService.listByEvent(eventId);
      const list = sales
        .filter((sale) => {
          if (!query.trim()) return true;
          const q = query.toLowerCase();
          return (
            sale.buyerEmail.toLowerCase().includes(q) ||
            (sale.eventName || '').toLowerCase().includes(q) ||
            (sale.sellerName || '').toLowerCase().includes(q)
          );
        })
        .map((sale) => {
          // Extract first and last name from sellerName
          const [firstName = '', lastName = ''] = (sale.sellerName || '').split(' ');
          
          return {
            id: sale.id,
            firstName: firstName,
            lastName: lastName,
            email: sale.buyerEmail,
            ticketType: sale.eventName,
            price: sale.total,
            validated: sale.paymentStatus === 'paid',
          } satisfies Row;
        });
      
      setRows(list);
    } catch (error) {
      console.error('Error loading sales:', error);
      // Optionally show error to user
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const header = ['id', 'firstName', 'lastName', 'email', 'ticketType', 'price', 'validated'];
    const lines = rows.map((r) =>
      [r.id, r.firstName, r.lastName, r.email, r.ticketType, r.price, r.validated ? 'true' : 'false']
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [header.join(','), ...lines].join('\\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_evento_${eventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <BackofficeLayout title="Reportes (MVP)">
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="ID de evento"
                placeholder="e.g. cbb46e0f-..."
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Buscar"
                placeholder="Comprador, email, tipo..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{ endAdornment: <InputAdornment position="end"><SearchIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 'auto' }}>
              <Button variant="outlined" onClick={load} disabled={!eventId || loading}>Aplicar</Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 'auto' }}>
              <Button startIcon={<FileDownloadIcon />} variant="contained" onClick={downloadCSV} disabled={rows.length === 0 || loading}>
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
          ) : !eventId ? (
            <Typography color="text.secondary">Ingresa un ID de evento para ver sus ventas.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Comprador</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Ticket</TableCell>
                  <TableCell align="right">Precio</TableCell>
                  <TableCell>Validado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{`${r.firstName || ''} ${r.lastName || ''}`.trim() || '—'}</TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>{r.ticketType}</TableCell>
                    <TableCell align="right">{r.price.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</TableCell>
                    <TableCell>{r.validated ? 'Sí' : 'No'}</TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">Sin resultados para los filtros aplicados.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </BackofficeLayout>
  );
}
