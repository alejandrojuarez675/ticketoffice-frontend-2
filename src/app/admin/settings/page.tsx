'use client';

import React, { useEffect, useState } from 'react';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import { Box, Typography, Card, CardContent, TextField, MenuItem, Button } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { isLoading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ feePercent: 10, currency: 'ARS', timezone: 'America/Buenos_Aires' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/auth/login?next=/admin/settings');
      return;
    }
    if (!isAdmin) {
      router.replace('/');
      return;
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
  };

  return (
    <BackofficeLayout title="Configuración">
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Typography variant="h5">Configuración</Typography>

        <Card>
          <CardContent sx={{ display: 'grid', gap: 2 }}>
            <TextField
              label="Tasa de servicio (%)"
              type="number"
              value={form.feePercent}
              onChange={(e) => setForm((f) => ({ ...f, feePercent: Number(e.target.value || 0) }))}
            />
            <TextField
              select
              label="Moneda por defecto"
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
            >
              <MenuItem value="ARS">ARS</MenuItem>
              <MenuItem value="COP">COP</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
            </TextField>
            <TextField
              select
              label="Zona horaria"
              value={form.timezone}
              onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
            >
              <MenuItem value="America/Buenos_Aires">America/Buenos_Aires</MenuItem>
              <MenuItem value="America/Bogota">America/Bogota</MenuItem>
            </TextField>

            <Box>
              <Button variant="contained" onClick={save} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </BackofficeLayout>
  );
}