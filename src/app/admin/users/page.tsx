// src/app/admin/users/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { VendorService, type Vendor } from '@/services/VendorService';
import { AuthService } from '@/services/AuthService';
import { useRouter } from 'next/navigation';
import { ConfigService } from '@/services/ConfigService';

function isValidEmail(s: string) {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(s);
}

export default function UsersPage() {
  const router = useRouter();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '' });

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [toast, setToast] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' | 'info' }>({
    open: false,
    msg: '',
    sev: 'success',
  });

  // Guard
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.replace('/auth/login?next=/admin/users');
      return;
    }
    if (!AuthService.isAdmin()) {
      router.replace('/');
      return;
    }
  }, [router]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const list = await VendorService.list();
        if (!active) return;
        setVendors(list);
      } catch {
        if (!active) return;
        setErr('No se pudo cargar la lista de vendedores');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const openMenu = (e: React.MouseEvent<HTMLElement>, id: string) => {
    setAnchorEl(e.currentTarget);
    setSelectedId(id);
  };
  const closeMenu = () => {
    setAnchorEl(null);
    setSelectedId(null);
  };

  const toggleActive = async () => {
    if (!selectedId) return;
    try {
      const current = vendors.find((x) => x.id === selectedId);
      if (!current) return;
      await VendorService.setActive(selectedId, current.status !== 'active');
      setVendors((prev) =>
        prev.map((x) => (x.id === selectedId ? { ...x, status: current.status === 'active' ? 'disabled' : 'active' } : x))
      );
      setToast({ open: true, msg: 'Estado actualizado', sev: 'success' });
    } catch {
      setToast({ open: true, msg: 'No se pudo actualizar el estado', sev: 'error' });
    } finally {
      closeMenu();
    }
  };

  const invite = async () => {
    const name = inviteForm.name.trim();
    const email = inviteForm.email.trim();
    if (!name || !isValidEmail(email)) {
      setToast({ open: true, msg: 'Completa un nombre y email válido', sev: 'error' });
      return;
    }
    try {
      const v = await VendorService.invite(name, email);
      setVendors((prev) => [v, ...prev]);
      setInviteForm({ name: '', email: '' });
      setInviteOpen(false);
      setToast({ open: true, msg: ConfigService.isMockedEnabled() ? 'Invitación creada (mock)' : 'Invitación enviada', sev: 'success' });
    } catch {
      setToast({ open: true, msg: 'No se pudo invitar al vendedor', sev: 'error' });
    }
  };

  return (
    <BackofficeLayout title="Vendedores">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Gestión de vendedores</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={() => setInviteOpen(true)}>
          Invitar vendedor
        </Button>
      </Box>

      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" alignItems="center" justifyContent="center" minHeight="40vh">
              <CircularProgress />
            </Box>
          ) : err ? (
            <Box>
              <Typography color="error" sx={{ mb: 2 }}>
                {err}
              </Typography>
              <Button onClick={() => router.refresh()}>Reintentar</Button>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Eventos</TableCell>
                  <TableCell>Creado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vendors.map((v) => (
                  <TableRow key={v.id} hover>
                    <TableCell>{v.name}</TableCell>
                    <TableCell>{v.email}</TableCell>
                    <TableCell>{v.status}</TableCell>
                    <TableCell>{v.events}</TableCell>
                    <TableCell>{v.createdAt}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={(e) => openMenu(e, v.id)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {vendors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No hay vendedores.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={closeMenu}>
        <MenuItem onClick={toggleActive}>
          {vendors.find((x) => x.id === selectedId)?.status === 'active' ? 'Desactivar' : 'Activar'}
        </MenuItem>
        <MenuItem onClick={closeMenu}>Cerrar</MenuItem>
      </Menu>

      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Invitar vendedor</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Nombre"
                value={inviteForm.name}
                onChange={(e) => setInviteForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteOpen(false)}>Cancelar</Button>
          <Button onClick={invite} variant="contained" disabled={!inviteForm.name.trim() || !isValidEmail(inviteForm.email)}>
            Enviar invitación
          </Button>
        </DialogActions>
      </Dialog>

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
