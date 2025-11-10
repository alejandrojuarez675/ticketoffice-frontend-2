// src/app/admin/settings/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import { Box, Typography, Card, CardContent, TextField, MenuItem, Button, Snackbar, Alert, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/AuthService';

type SettingsForm = {
  feePercent: number;
  currency: 'ARS' | 'COP' | 'USD';
  timezone: 'America/Buenos_Aires' | 'America/Bogota';
};

const STORAGE_KEY = 'admin:settings:mvp';

export default function SettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState<SettingsForm>({
    feePercent: 10,
    currency: 'ARS',
    timezone: 'America/Buenos_Aires',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' | 'info' }>({
    open: false,
    msg: '',
    sev: 'success',
  });

  // Guard básico
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.replace('/auth/login?next=/admin/settings');
      return;
    }
    if (!AuthService.isAdmin()) {
      router.replace('/');
      return;
    }
  }, [router]);

  // Cargar settings (MVP: localStorage)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SettingsForm;
        setForm(parsed);
      }
    } catch {}
  }, []);

  const save = async () => {
    if (Number.isNaN(form.feePercent) || form.feePercent < 0 || form.feePercent > 30) {
      setToast({ open: true, msg: 'La tasa debe estar entre 0% y 30%', sev: 'error' });
      return;
    }
    try {
      setSaving(true);
      // MVP: persistimos localmente. A futuro: llamar endpoint del BE.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
      setToast({ open: true, msg: 'Configuración guardada (MVP local)', sev: 'success' });
    } catch {
      setToast({ open: true, msg: 'No se pudo guardar', sev: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = () => {
    const def: SettingsForm = { feePercent: 10, currency: 'ARS', timezone: 'America/Buenos_Aires' };
    setForm(def);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(def));
    } catch {}
    setToast({ open: true, msg: 'Valores restablecidos', sev: 'info' });
  };

  return (
    <BackofficeLayout title="Configuración">
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Typography variant="h5">Configuración (MVP)</Typography>

        <Card>
          <CardContent sx={{ display: 'grid', gap: 2 }}>
            <TextField
              label="Tasa de servicio (%)"
              type="number"
              value={form.feePercent}
              onChange={(e) => setForm((f) => ({ ...f, feePercent: Number(e.target.value || 0) }))}
              inputProps={{ min: 0, max: 30, step: 0.5 }}
            />
            <TextField
              select
              label="Moneda por defecto"
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value as SettingsForm['currency'] }))}
            >
              <MenuItem value="ARS">ARS</MenuItem>
              <MenuItem value="COP">COP</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
            </TextField>
            <TextField
              select
              label="Zona horaria"
              value={form.timezone}
              onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value as SettingsForm['timezone'] }))}
            >
              <MenuItem value="America/Buenos_Aires">America/Buenos_Aires</MenuItem>
              <MenuItem value="America/Bogota">America/Bogota</MenuItem>
            </TextField>

            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={save} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
              <Button variant="text" onClick={resetDefaults} disabled={saving}>
                Restablecer
              </Button>
            </Stack>

            <Typography variant="caption" color="text.secondary">
              Nota: En el MVP estos valores se guardan en tu navegador. En la fase siguiente se guardarán en el backend.
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.sev} variant="filled" onClose={() => setToast((t) => ({ ...t, open: false }))}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </BackofficeLayout>
  );
}
