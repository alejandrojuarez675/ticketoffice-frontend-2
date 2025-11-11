// src/app/admin/validate/[saleId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, Grid, IconButton, InputAdornment, Paper, Snackbar, TextField, Typography, Alert,
} from '@mui/material';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import {
  ArrowBack as ArrowBackIcon,
  ContentCopy as ContentCopyIcon,
  QrCodeScanner as QrCodeScannerIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { ConfigService } from '@/services/ConfigService';

export default function SalesValidationPage() {
  return (
    <BackofficeLayout title="Validar Venta">
      <SalesValidationContent />
    </BackofficeLayout>
  );
}

function SalesValidationContent() {
  const { saleId } = useParams<{ saleId: string }>();
  const router = useRouter();

  const [ticketId, setTicketId] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [validatedAt, setValidatedAt] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false, message: '', severity: 'info',
  });

  useEffect(() => {
    if (saleId) {
      setTicketId(String(saleId));
      if (!ConfigService.isMockedEnabled()) {
        // En BE real necesitamos eventId para validar; redirige a la pantalla con query eventId
        setSnackbar({
          open: true,
          message: 'Para validar en backend necesitas el eventId. Usa /admin/events/[id]/validate?saleId=...',
          severity: 'info',
        });
      }
    }
  }, [saleId]);

  const handleValidate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const val = ticketId.trim();
    if (!val) return;

    if (!ConfigService.isMockedEnabled()) {
      setSnackbar({
        open: true,
        message: 'Usa /admin/events/[id]/validate para validar con backend (se requiere eventId).',
        severity: 'warning',
      });
      return;
    }

    // Mock OK
    setValidatedAt(new Date().toISOString());
    setOpenDialog(true);
    setSnackbar({ open: true, message: 'Entrada validada (mock)', severity: 'success' });
  };

  const handleCopy = () => {
    if (!ticketId) return;
    navigator.clipboard.writeText(ticketId);
    setSnackbar({ open: true, message: 'ID copiado', severity: 'info' });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => router.back()} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Validar Venta</Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Validar</Typography>
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
                <Button type="submit" variant="contained" disabled={!ticketId.trim()} sx={{ height: '56px' }}>
                  Validar
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
            }}
          >
            <QrCodeScannerIcon color="action" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Para validar con backend usa la pantalla por evento: /admin/events/[id]/validate
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
                <Typography variant="body2" color="text.secondary">{new Date(validatedAt).toLocaleString()}</Typography>
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
