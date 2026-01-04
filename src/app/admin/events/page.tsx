// src/app/admin/events/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import {
  Box,
  Button,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import BarChartIcon from '@mui/icons-material/BarChart';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import AddIcon from '@mui/icons-material/Add';
import Pagination from '@mui/material/Pagination';
import { EventService } from '@/services/EventService';
import type { EventForList } from '@/types/Event';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';

function statusChip(status?: string) {
  const s = (status || '').toUpperCase();
  if (s === 'ACTIVE' || s === 'PUBLISHED') {
    return (
      <Chip 
        label="Publicado" 
        size="small"
        sx={{
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          color: 'rgba(16, 185, 129, 1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          fontWeight: 600,
          fontSize: '0.75rem',
          '&::before': {
            content: '""',
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 1)',
            marginLeft: '10px',
            marginRight: '8px',
          },
        }}
      />
    );
  }
  if (s === 'DRAFT') {
    return (
      <Chip 
        label="Borrador" 
        size="small"
        sx={{
          backgroundColor: 'rgba(39, 39, 42, 1)',
          color: 'rgba(161, 161, 170, 1)',
          border: '1px solid rgba(63, 63, 70, 1)',
          fontWeight: 600,
          fontSize: '0.75rem',
          '&::before': {
            content: '""',
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: 'rgba(113, 113, 122, 1)',
            marginRight: '6px',
          },
        }}
      />
    );
  }
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(rows.length / itemsPerPage);
  const paginatedRows = rows.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, eventId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedEventId(eventId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEventId(null);
  };

  const handleDeleteClick = (eventId: string) => {
    setDeletingId(eventId);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await EventService.deleteEvent(deletingId);
      setRows((prev) => prev.filter((e) => e.id !== deletingId));
      setDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      alert('No se pudo eliminar el evento. Inténtalo de nuevo.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeletingId(null);
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
      <Box>
        {/* Page Header */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: 2, mb: 4 }}>
          <Box>
            <Typography 
              variant="h3" 
              sx={{ 
                fontSize: '1.875rem',
                fontWeight: 600,
                color: 'white',
                letterSpacing: '-0.025em',
                mb: 1,
              }}
            >
              Mis eventos
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(113, 113, 122, 1)',
                fontSize: '0.875rem',
              }}
            >
              Gestiona y monitorea todos tus eventos activos y pasados.
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            component={Link} 
            href="/admin/events/new"
            startIcon={<AddIcon />}
            sx={{
              color: 'white',
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              py: 1.25,
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'rgba(139, 92, 246, 1)',
                boxShadow: '0 6px 20px rgba(124, 58, 237, 0.5)',
              },
            }}
          >
            Nuevo evento
          </Button>
        </Box>

        {isMobile ? (
          // Vista móvil: Cards
          <Stack spacing={2}>
            {paginatedRows.map((e) => (
              <Card 
                key={e.id} 
                variant="outlined"
                onClick={() => router.push(`/admin/events/${e.id}`)}
                sx={{
                  cursor: 'pointer',
                  position: 'relative',
                  backgroundImage: e.bannerUrl ? `linear-gradient(to right, rgba(10, 10, 10, 0.95), rgba(10, 10, 10, 0.98)), url(${e.bannerUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  '&:hover': {
                    borderColor: 'rgba(124, 58, 237, 0.3)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" sx={{ flex: 1, pr: 1 }}>
                      {e.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {new Date(e.date).toLocaleString('es-AR')}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {statusChip(e.status)}
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-start', flexWrap: 'wrap', gap: 1, px: 2, pb: 2 }} onClick={(e) => e.stopPropagation()}>
                  <Button 
                    component={Link} 
                    href={`/admin/events/${e.id}/edit`} 
                    size="small" 
                    variant="outlined"
                    startIcon={<EditIcon />}
                  >
                    Editar
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleMenuOpen(event, e.id);
                    }}
                    sx={{ 
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(161, 161, 170, 1)',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                    }}
                  >
                    Acciones
                  </Button>
                </CardActions>
              </Card>
            ))}
            {paginatedRows.length === 0 && rows.length > 0 && (
              <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'rgba(10, 10, 10, 1)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <Typography color="text.secondary">No hay eventos en esta página.</Typography>
              </Paper>
            )}
            {rows.length === 0 && (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">No tienes eventos aún.</Typography>
              </Paper>
            )}
          </Stack>
        ) : (
          <Paper 
            sx={{ 
              overflow: 'hidden',
              backgroundColor: 'rgba(10, 10, 10, 1)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
            }}
          >
            <Table size="small">
              <TableHead sx={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(113, 113, 122, 1)' }}>Título</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(113, 113, 122, 1)' }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(113, 113, 122, 1)' }}>Estado</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(113, 113, 122, 1)' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ '& .MuiTableRow-root': { borderBottom: '1px solid rgba(255, 255, 255, 0.05)' } }}>
                {paginatedRows.map((e) => (
                  <TableRow 
                    key={e.id}
                    onClick={() => router.push(`/admin/events/${e.id}`)}
                    sx={{ 
                      cursor: 'pointer',
                      position: 'relative',
                      backgroundImage: e.bannerUrl ? `linear-gradient(to right, rgba(10, 10, 10, 0.95), rgba(10, 10, 10, 0.98)), url(${e.bannerUrl})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.02)' },
                      '&:hover .event-name': { color: 'rgba(167, 139, 250, 1)' },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '4px',
                            backgroundColor: 'rgba(39, 39, 42, 1)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'rgba(113, 113, 122, 1)',
                          }}
                        >
                          <MusicNoteIcon sx={{ fontSize: '1.25rem' }} />
                        </Box>
                        <Box>
                          <Typography 
                            className="event-name"
                            sx={{ 
                              fontWeight: 500,
                              color: 'rgba(212, 212, 216, 1)',
                              fontSize: '0.875rem',
                              transition: 'color 0.2s ease',
                            }}
                          >
                            {e.name}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: 'rgba(113, 113, 122, 1)' }}>
                            ID: #{e.id.substring(0, 8)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography sx={{ fontSize: '0.875rem', color: 'rgba(161, 161, 170, 1)' }}>
                          {new Date(e.date).toLocaleDateString('es-AR')}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: 'rgba(113, 113, 122, 1)' }}>
                          {new Date(e.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{statusChip(e.status)}</TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton 
                          component={Link} 
                          href={`/admin/events/${e.id}`} 
                          size="small"
                          title="Ver detalles"
                          sx={{ 
                            color: 'rgba(113, 113, 122, 1)',
                            '&:hover': { 
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              color: 'rgba(212, 212, 216, 1)',
                            },
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          component={Link} 
                          href={`/admin/events/${e.id}/edit`} 
                          size="small"
                          title="Editar"
                          sx={{ 
                            color: 'rgba(113, 113, 122, 1)',
                            '&:hover': { 
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              color: 'rgba(212, 212, 216, 1)',
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          component={Link} 
                          href={`/admin/events/${e.id}/sales`} 
                          size="small"
                          title="Ventas"
                          sx={{ 
                            color: 'rgba(113, 113, 122, 1)',
                            '&:hover': { 
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              color: 'rgba(212, 212, 216, 1)',
                            },
                          }}
                        >
                          <BarChartIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          component={Link} 
                          href={`/admin/events/${e.id}/validate`} 
                          size="small"
                          title="Validar entradas"
                          sx={{ 
                            color: 'rgba(113, 113, 122, 1)',
                            '&:hover': { 
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              color: 'rgba(212, 212, 216, 1)',
                            },
                          }}
                        >
                          <QrCodeScannerIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteClick(e.id)}
                          title="Eliminar evento"
                          sx={{ 
                            color: 'rgba(113, 113, 122, 1)',
                            '&:hover': { 
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              color: 'rgba(239, 68, 68, 1)',
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedRows.length === 0 && rows.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">No hay eventos en esta página.</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">No tienes eventos aún.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            {/* Paginación */}
            {totalPages > 1 && (
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 3,
                  py: 2,
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  backgroundColor: 'rgba(255, 255, 255, 0.01)',
                }}
              >
                <Typography sx={{ fontSize: '0.75rem', color: 'rgba(113, 113, 122, 1)' }}>
                  Mostrando {((page - 1) * itemsPerPage) + 1}-{Math.min(page * itemsPerPage, rows.length)} de {rows.length} eventos
                </Typography>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={(_, newPage) => setPage(newPage)}
                  shape="rounded"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: 'rgba(161, 161, 170, 1)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(124, 58, 237, 0.1)',
                        color: 'rgba(167, 139, 250, 1)',
                        borderColor: 'rgba(124, 58, 237, 0.3)',
                        '&:hover': {
                          backgroundColor: 'rgba(124, 58, 237, 0.15)',
                        },
                      },
                    },
                  }}
                />
              </Box>
            )}
          </Paper>
        )}

        {/* Paginación para mobile */}
        {isMobile && totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={(_, newPage) => setPage(newPage)}
              shape="rounded"
              sx={{
                '& .MuiPaginationItem-root': {
                  color: 'rgba(161, 161, 170, 1)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(124, 58, 237, 0.1)',
                    color: 'rgba(167, 139, 250, 1)',
                    borderColor: 'rgba(124, 58, 237, 0.3)',
                    '&:hover': {
                      backgroundColor: 'rgba(124, 58, 237, 0.15)',
                    },
                  },
                },
              }}
            />
          </Box>
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
          <MenuItem 
            onClick={() => {
              if (selectedEventId) handleDeleteClick(selectedEventId);
            }}
            sx={{ color: 'error.main' }}
          >
            Eliminar evento
          </MenuItem>
        </Menu>

        {/* Dialog de confirmación de eliminación */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          aria-labelledby="delete-dialog-title"
        >
          <DialogTitle id="delete-dialog-title">
            ¿Confirmar eliminación?
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} color="inherit">
              Cancelar
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </BackofficeLayout>
  );
}
