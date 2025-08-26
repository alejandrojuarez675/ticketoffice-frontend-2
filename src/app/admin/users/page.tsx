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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { VendorService, type Vendor } from '@/services/VendorService';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const { isLoading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '' });

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/auth/login?next=/admin/users');
      return;
    }
    if (!isAdmin) {
      router.replace('/');
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const list = await VendorService.list();
        setVendors(list);
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoading, isAuthenticated, isAdmin, router]);

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
    const v = vendors.find((x) => x.id === selectedId);
    if (!v) return;
    await VendorService.setActive(selectedId, v.status !== 'active');
    setVendors((prev) =>
      prev.map((x) => (x.id === selectedId ? { ...x, status: v.status === 'active' ? 'disabled' : 'active' } : x))
    );
    closeMenu();
  };

  const invite = async () => {
    const v = await VendorService.invite(inviteForm.name.trim(), inviteForm.email.trim());
    setVendors((prev) => [v, ...prev]);
    setInviteForm({ name: '', email: '' });
    setInviteOpen(false);
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
          <TextField
            fullWidth
            label="Nombre"
            sx={{ mt: 1 }}
            value={inviteForm.name}
            onChange={(e) => setInviteForm((f) => ({ ...f, name: e.target.value }))}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            sx={{ mt: 2 }}
            value={inviteForm.email}
            onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteOpen(false)}>Cancelar</Button>
          <Button onClick={invite} variant="contained" disabled={!inviteForm.name.trim() || !inviteForm.email.trim()}>
            Enviar invitación
          </Button>
        </DialogActions>
      </Dialog>
    </BackofficeLayout>
  );
}