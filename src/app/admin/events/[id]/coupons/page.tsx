// src/app/admin/events/[id]/coupons/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import { Box, Button, Card, CardContent, Grid, TextField, Typography } from '@mui/material';
import { CouponService, type Coupon } from '@/services/CouponService';
import { useAuth } from '@/hooks/useAuth';
import { EventService } from '@/services/EventService';

export default function EventCouponsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isLoading, isAuthenticated, isAdmin, isSeller, user } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState({ code: '', type: 'percent' as 'percent' | 'fixed', value: 10 });
  const [ownerChecked, setOwnerChecked] = useState(false);

  // Auth/backoffice guard and ownership check
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/auth/login?next=' + encodeURIComponent(`/admin/events/${id}/coupons`));
      return;
    }
    if (!(isAdmin || isSeller)) {
      router.replace('/');
      return;
    }
    // If seller, ensure event belongs to current user
    (async () => {
      if (!isSeller || !user?.id) {
        setOwnerChecked(true);
        return;
      }
      try {
        const ev = await EventService.getEventById(String(id));
        if (ev?.organizer?.id && ev.organizer.id !== String(user.id)) {
          router.replace('/admin/events');
          return;
        }
      } finally {
        setOwnerChecked(true);
      }
    })();
  }, [id, isLoading, isAuthenticated, isAdmin, isSeller, user?.id, router]);

  useEffect(() => {
    if (!ownerChecked) return;
    (async () => {
      const list = await CouponService.listByEvent(id);
      setCoupons(list);
    })();
  }, [id, ownerChecked]);

  const create = async () => {
    if (!form.code.trim()) return;
    const c = await CouponService.create(id, form);
    setCoupons((prev) => [c, ...prev]);
    setForm({ code: '', type: 'percent', value: 10 });
  };

  return (
    <BackofficeLayout title="Cupones">
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Cupones del evento
        </Typography>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth label="Código" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="Tipo"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'percent' | 'fixed' }))}
                  SelectProps={{ native: true }}
                >
                  <option value="percent">Porcentaje</option>
                  <option value="fixed">Fijo</option>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Valor"
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value || 0) }))}
                />
              </Grid>
            </Grid>
            <Button variant="contained" sx={{ mt: 2 }} onClick={create}>
              Crear cupón
            </Button>
          </CardContent>
        </Card>

        <Typography variant="h6" sx={{ mb: 1 }}>
          Existentes
        </Typography>
        {coupons.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No hay cupones aún.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {coupons.map((c) => (
              <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1">{c.code}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {c.type === 'percent' ? `${c.value}%` : `$${c.value}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Usos: {c.used ?? 0} {c.maxUses ? `/ ${c.maxUses}` : ''}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </BackofficeLayout>
  );
}