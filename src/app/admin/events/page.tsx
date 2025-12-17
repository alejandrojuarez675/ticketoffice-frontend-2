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
  Card,
  CardContent,
  CardActions,
  Stack,
  useMediaQuery,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [rows, setRows] = useState<EventForList[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, eventId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedEventId(eventId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEventId(null);
  };

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
            {isMobile ? '+' : 'Nuevo evento'}
          </Button>
        </Box>

        {isMobile ? (
          // Vista móvil: Cards
          <Stack spacing={2}>
            {rows.map((e) => (
              <Card key={e.id} variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" sx={{ flex: 1, pr: 1 }}>
                      {e.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(event) => handleMenuOpen(event, e.id)}
                      sx={{ mt: -1 }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {new Date(e.date).toLocaleString('es-AR')}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {statusChip(e.status)}
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-start', flexWrap: 'wrap', gap: 0.5, px: 2, pb: 2 }}>
                  <Button component={Link} href={`/admin/events/${e.id}`} size="small" variant="outlined">
                    Ver
                  </Button>
                  <Button component={Link} href={`/admin/events/${e.id}/edit`} size="small" variant="outlined">
                    Editar
                  </Button>
                  <Button component={Link} href={`/admin/events/${e.id}/sales`} size="small" variant="outlined">
                    Ventas
                  </Button>
                  <Button component={Link} href={`/admin/events/${e.id}/validate`} size="small" variant="outlined">
                    Validar
                  </Button>
                </CardActions>
              </Card>
            ))}
            {rows.length === 0 && (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">No tienes eventos aún.</Typography>
              </Paper>
            )}
          </Stack>
        ) : (
          // Vista desktop: Tabla mejorada
          <Paper sx={{ overflow: 'hidden' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Título</strong></TableCell>
                  <TableCell><strong>Fecha</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell align="right"><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((e) => (
                  <TableRow key={e.id} hover>
                    <TableCell>{e.name}</TableCell>
                    <TableCell>{new Date(e.date).toLocaleString('es-AR')}</TableCell>
                    <TableCell>{statusChip(e.status)}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button component={Link} href={`/admin/events/${e.id}`} size="small" variant="outlined">
                          Ver
                        </Button>
                        <Button component={Link} href={`/admin/events/${e.id}/edit`} size="small" variant="outlined">
                          Editar
                        </Button>
                        <Button component={Link} href={`/admin/events/${e.id}/sales`} size="small" variant="outlined">
                          Ventas
                        </Button>
                        <Button component={Link} href={`/admin/events/${e.id}/validate`} size="small" variant="outlined">
                          Validar
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">No tienes eventos aún.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        )}

        {/* Menu para mobile */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem component={Link} href={`/admin/events/${selectedEventId}`} onClick={handleMenuClose}>
            Ver detalles
          </MenuItem>
          <MenuItem component={Link} href={`/admin/events/${selectedEventId}/edit`} onClick={handleMenuClose}>
            Editar evento
          </MenuItem>
          <MenuItem component={Link} href={`/admin/events/${selectedEventId}/sales`} onClick={handleMenuClose}>
            Ver ventas
          </MenuItem>
          <MenuItem component={Link} href={`/admin/events/${selectedEventId}/validate`} onClick={handleMenuClose}>
            Validar entradas
          </MenuItem>
        </Menu>
      </Container>
    </BackofficeLayout>
  );
}
