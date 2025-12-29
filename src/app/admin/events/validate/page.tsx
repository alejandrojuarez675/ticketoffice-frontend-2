// src/app/admin/events/[id]/validate/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import {
  ArrowBack as ArrowBackIcon,
  ContentCopy as ContentCopyIcon,
  QrCodeScanner as QrCodeScannerIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { AuthService } from '@/services/AuthService';
import { SalesService } from '@/services/SalesService';

export default function ValidateEventPage() {
  return (
    <BackofficeLayout title="Validar Entradas">
      <ValidateEventInner />
    </BackofficeLayout>
  );
}

function ValidateEventInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const search = useSearchParams();
  const preSaleId = search.get('saleId') || '';

  const [ticketId, setTicketId] = useState(preSaleId);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'info',
  });
  const [submitting, setSubmitting] = useState(false);
  const [validatedAt, setValidatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.replace(`/auth/login?next=${encodeURIComponent(`/admin/events/${id}/validate`)}`);
      return;
    }
    if (!(AuthService.isAdmin() || AuthService.isSeller())) {
      router.replace('/');
      return;
    }
  }, [router, id]);

  /**
   * Endpoint BE: POST /api/v1/events/{eventId}/sales/{saleId}/validate
   */
  const handleValidate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const sessionId = ticketId.trim();
    if (!sessionId) return;
    try {
      setSubmitting(true);
      await SalesService.validateSale(id, sessionId);
      setValidatedAt(new Date().toISOString());
      setOpenDialog(true);
      setSnackbar({ open: true, message: 'Entrada validada correctamente', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'No se pudo validar la entrada', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (!ticketId) return;
    navigator.clipboard.writeText(ticketId);
    setSnackbar({ open: true, message: 'ID copiado al portapapeles', severity: 'info' });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => router.push(`/admin/events/${id}`)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Validar Entradas</Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Validar entrada del evento
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Box component="form" onSubmit={handleValidate} sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  label="ID de venta/ticket"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  slotProps={{
                    input: {
                      endAdornment: ticketId ? (
                        <InputAdornment position="end">
                          <IconButton onClick={handleCopy} size="small" edge="end" title="Copiar ID">
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ) : undefined,
                    },
                  }}
                />
              </Grid>
              <Grid>
                <Button type="submit" variant="contained" disabled={!ticketId.trim() || submitting} sx={{ height: '56px' }}>
                  {submitting ? 'Validando…' : 'Validar'}
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Paper
            variant="outlined"
            sx={{
              p: 3,
              textAlign: 'center',
              borderStyle: 'dashed',
              borderColor: 'divider',
              backgroundColor: 'action.hover',
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'action.selected' },
            }}
            onClick={() => setSnackbar({ open: true, message: 'Escáner QR en desarrollo (MVP)', severity: 'info' })}
          >
            <QrCodeScannerIcon color="action" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Escanear Código QR
            </Typography>
            <Typography variant="body2" color="text.secondary">
              (Función en desarrollo)
            </Typography>
          </Paper>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Resultado de validación</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            <Box>
              <Typography variant="subtitle2">ID</Typography>
              <Typography variant="body1">{ticketId}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">Estado</Typography>
              <Chip label="Validada" color="success" icon={<CheckCircleIcon />} sx={{ mt: 0.5 }} />
            </Box>
            {validatedAt && (
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography variant="subtitle2">Fecha de Validación</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(validatedAt).toLocaleString()}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

