// src/app/admin/profile/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Skeleton,
  Alert,
  Stack,
  Chip,
  TextField,
  CircularProgress,
  Snackbar,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import EventIcon from '@mui/icons-material/Event';
import BusinessIcon from '@mui/icons-material/Business';
import SaveIcon from '@mui/icons-material/Save';
import { OrganizerService, type OrganizerData } from '@/services/OrganizerService';
import { sanitizeString, sanitizeUrl } from '@/utils/sanitize';
import { capitalizeFirstLetter } from '@/utils/format';

export default function SellerProfilePage() {
  const { user, isLoading, isAuthenticated, refresh } = useAuth();
  const router = useRouter();

  // Estado para el formulario de organizador
  const [showOrganizerForm, setShowOrganizerForm] = useState(false);
  const [organizerData, setOrganizerData] = useState<OrganizerData>({
    name: '',
    url: '',
    logo: { url: '', alt: '' },
  });
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?next=/admin/profile');
    }
  }, [isLoading, isAuthenticated, router]);

  // Refresh user data when component mounts
  useEffect(() => {
    refresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateOrganizer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitizar inputs antes de enviar
    const sanitizedName = sanitizeString(organizerData.name);
    const sanitizedWebUrl = sanitizeUrl(organizerData.url) || '';
    const sanitizedLogoUrl = sanitizeUrl(organizerData.logo.url) || '';
    
    if (!sanitizedName) {
      setSnackbar({ open: true, message: 'El nombre del organizador es obligatorio.', severity: 'error' });
      return;
    }

    setSaving(true);
    try {
      await OrganizerService.createOrganizer({
        name: sanitizedName,
        url: sanitizedWebUrl,
        logo: {
          url: sanitizedLogoUrl,
          alt: sanitizeString(organizerData.logo.alt) || sanitizedName,
        },
      });
      
      setSnackbar({ open: true, message: '¡Perfil de organizador creado exitosamente!', severity: 'success' });
      setShowOrganizerForm(false);
      
      // Refrescar datos del usuario
      await refresh();
    } catch (err) {
      console.error('Error creando organizador:', err);
      setSnackbar({ open: true, message: 'No se pudo crear el perfil de organizador.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <BackofficeLayout title="Mi perfil">
        <Box>
          <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {[1, 2, 3].map((i) => (
              <Grid key={i} size={{ xs: 12, sm: 4 }}>
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </BackofficeLayout>
    );
  }

  if (!user) {
    return (
      <BackofficeLayout title="Mi perfil">
        <Alert severity="warning">
          No se pudo cargar tu perfil. Por favor, inicia sesión nuevamente.
        </Alert>
      </BackofficeLayout>
    );
  }

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'seller': return 'Organizador';
      case 'user': return 'Usuario';
      default: return 'Usuario';
    }
  };

  const getRoleColor = (role?: string): 'primary' | 'secondary' | 'default' => {
    switch (role) {
      case 'admin': return 'secondary';
      case 'seller': return 'primary';
      default: return 'default';
    }
  };

  // Verificar si el usuario ya tiene datos de organizador
  const hasOrganizer = !!(user as unknown as { organizer?: { id: string; name: string } }).organizer?.id;
  const organizerInfo = (user as unknown as { organizer?: { id: string; name: string; url?: string } }).organizer;

  return (
    <BackofficeLayout title="Mi perfil">
      <Box>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              ¡Hola, {capitalizeFirstLetter(user.name || user.username)}!
            </Typography>
            <Chip 
              label={getRoleLabel(user.role)} 
              color={getRoleColor(user.role)} 
              size="small" 
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <BadgeIcon color="primary" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Usuario
                  </Typography>
                </Stack>
                <Typography variant="h5">
                  {user.username}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <EmailIcon color="primary" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                </Stack>
                <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>
                  {user.email || '—'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <EventIcon color="primary" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Mis Eventos
                  </Typography>
                </Stack>
                <Button 
                  component={Link} 
                  href="/admin/events" 
                  variant="contained" 
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Ver mis eventos
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Sección de Organizador */}
        <Divider sx={{ my: 4 }} />
        
        <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon color="primary" />
          Perfil de Organizador
        </Typography>

        {hasOrganizer ? (
          <Card sx={{ maxWidth: 600 }}>
            <CardContent>
              <Alert severity="success" sx={{ mb: 2 }}>
                Ya tienes configurado tu perfil de organizador.
              </Alert>
              <Typography variant="h6">{organizerInfo?.name}</Typography>
              {organizerInfo?.url && (
                <Typography variant="body2" color="text.secondary">
                  {organizerInfo.url}
                </Typography>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card sx={{ maxWidth: 600 }}>
            <CardContent>
              {!showOrganizerForm ? (
                <>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Aún no has configurado tu perfil de organizador. Crea uno para poder gestionar tus eventos.
                  </Alert>
                  <Button
                    variant="contained"
                    onClick={() => setShowOrganizerForm(true)}
                    startIcon={<BusinessIcon />}
                  >
                    Crear perfil de organizador
                  </Button>
                </>
              ) : (
                <Box component="form" onSubmit={handleCreateOrganizer}>
                  <Typography variant="h6" gutterBottom>
                    Crear perfil de organizador
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="Nombre del organizador *"
                    value={organizerData.name}
                    onChange={(e) => setOrganizerData(prev => ({ ...prev, name: e.target.value }))}
                    margin="normal"
                    placeholder="Ej: Productora de Eventos ABC"
                    helperText="Este nombre aparecerá en tus eventos"
                  />

                  <TextField
                    fullWidth
                    label="Sitio web (opcional)"
                    value={organizerData.url}
                    onChange={(e) => setOrganizerData(prev => ({ ...prev, url: e.target.value }))}
                    margin="normal"
                    placeholder="https://www.tuempresa.com"
                  />

                  <TextField
                    fullWidth
                    label="URL del logo (opcional)"
                    value={organizerData.logo.url}
                    onChange={(e) => setOrganizerData(prev => ({ 
                      ...prev, 
                      logo: { ...prev.logo, url: e.target.value } 
                    }))}
                    margin="normal"
                    placeholder="https://www.tuempresa.com/logo.png"
                  />

                  <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={saving}
                      startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    >
                      {saving ? 'Guardando...' : 'Guardar'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setShowOrganizerForm(false)}
                      disabled={saving}
                    >
                      Cancelar
                    </Button>
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Acciones rápidas
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button 
              component={Link} 
              href="/admin/events/new" 
              variant="outlined"
            >
              Crear nuevo evento
            </Button>
            <Button 
              component={Link} 
              href="/admin/dashboard" 
              variant="outlined"
            >
              Ir al dashboard
            </Button>
          </Stack>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </BackofficeLayout>
  );
}
