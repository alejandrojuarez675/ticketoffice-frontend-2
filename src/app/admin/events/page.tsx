// src/app/admin/events/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material';
import { EventService } from '@/services/EventService';
import type { EventForList } from '@/types/Event';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';

function statusChip(status?: string) {
  const s = (status || '').toUpperCase();
  if (s === 'ACTIVE' || s === 'PUBLISHED') return <Chip label="Publicado" color="success" size="small" />;
  if (s === 'DRAFT') return <Chip label="Borrador" color="warning" size="small" />;
  if (s === 'CANCELLED') return <Chip label="Cancelado" color="error" size="small" />;
  return <Chip label={status || '—'} size="small" />;
}

export default function AdminEventsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const hasBackoffice = !!user && (user.role === 'admin' || user.role === 'seller');

  const [rows, setRows] = useState<EventForList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/auth/login?next=/admin/events');
      return;
    }
    if (!hasBackoffice) {
      router.replace('/');
      return;
    }

    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await EventService.getEvents(1, 50);
        if (!active) return;
        setRows(res.events || []);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [isLoading, isAuthenticated, hasBackoffice, router]);

  if (isLoading || loading) {
    return (
      <BackofficeLayout title="Eventos">
        <Box display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </BackofficeLayout>
    );
  }

  return (
    <BackofficeLayout title="Eventos">
      <Container sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">Mis eventos</Typography>
          <Button variant="contained" component={Link} href="/admin/events/new">
            Nuevo evento
          </Button>
        </Box>

        <Paper>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((e) => (
                <TableRow key={e.id} hover>
                  <TableCell>{e.name}</TableCell>
                  <TableCell>{new Date(e.date).toLocaleString('es-AR')}</TableCell>
                  <TableCell>{statusChip(e.status)}</TableCell>
                  <TableCell align="right">
                    <Button component={Link} href={`/admin/events/${e.id}`} size="small">
                      Ver
                    </Button>
                    <Button component={Link} href={`/admin/events/${e.id}/edit`} size="small">
                      Editar
                    </Button>
                    <Button component={Link} href={`/admin/events/${e.id}/sales`} size="small">
                      Ventas
                    </Button>
                    <Button component={Link} href={`/admin/events/${e.id}/validate`} size="small">
                      Validar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>No tienes eventos aún.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Container>
    </BackofficeLayout>
  );
}
