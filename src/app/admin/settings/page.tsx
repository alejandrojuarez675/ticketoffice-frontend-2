// src/app/admin/settings/page.tsx
'use client';

import React, { useState } from 'react';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Switch,
  FormControlLabel,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SaveIcon from '@mui/icons-material/Save';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Estados para configuraciones
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(true);

  // Estados para edición de perfil
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');

  // Estados para cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estados de diálogos
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSaveProfile = () => {
    // TODO: Implementar guardado de perfil
    setSuccessMessage('Perfil actualizado correctamente');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    // TODO: Implementar cambio de contraseña
    setSuccessMessage('Contraseña actualizada correctamente');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'ELIMINAR') {
      setErrorMessage('Por favor, escribe "ELIMINAR" para confirmar');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      // TODO: Implementar eliminación de cuenta
      await logout();
      router.push('/');
    } catch (error) {
      setErrorMessage('Error al eliminar la cuenta');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  return (
    <BackofficeLayout title="Configuración - TuEntradaYa">
      <Box>
        <Typography variant="h4" gutterBottom>
          Configuración
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Administra tu cuenta y preferencias
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        <Stack spacing={3}>
          {/* Información del perfil */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccountCircleIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Información del perfil</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Nombre completo"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <TextField
                fullWidth
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                fullWidth
                label="Teléfono"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+54 11 1234-5678"
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveProfile}
                  fullWidth={isMobile}
                >
                  Guardar cambios
                </Button>
              </Box>
            </Stack>
          </Paper>

          {/* Cambiar contraseña */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Seguridad</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Contraseña actual"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <TextField
                fullWidth
                label="Nueva contraseña"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                helperText="Mínimo 8 caracteres"
              />
              <TextField
                fullWidth
                label="Confirmar nueva contraseña"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={twoFactorAuth}
                      onChange={(e) => setTwoFactorAuth(e.target.checked)}
                    />
                  }
                  label="Autenticación de dos factores (2FA)"
                />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
                  Agrega una capa extra de seguridad a tu cuenta
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleChangePassword}
                  disabled={!currentPassword || !newPassword || !confirmPassword}
                  fullWidth={isMobile}
                >
                  Cambiar contraseña
                </Button>
              </Box>
            </Stack>
          </Paper>

          {/* Notificaciones */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NotificationsIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Notificaciones</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                  />
                }
                label="Notificaciones por correo electrónico"
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
                Recibe actualizaciones sobre tus eventos y ventas
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                  />
                }
                label="Notificaciones push"
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
                Recibe alertas en tiempo real en tu dispositivo
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={marketingEmails}
                    onChange={(e) => setMarketingEmails(e.target.checked)}
                  />
                }
                label="Correos de marketing"
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
                Recibe noticias, ofertas y novedades de TuEntradaYa
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="contained" startIcon={<SaveIcon />} fullWidth={isMobile}>
                  Guardar preferencias
                </Button>
              </Box>
            </Stack>
          </Paper>

          {/* Zona de peligro */}
          <Paper sx={{ p: 3, border: '2px solid', borderColor: 'error.main' }}>
            <Typography variant="h6" color="error" gutterBottom>
              Zona de peligro
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="body2" color="text.secondary" paragraph>
              Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, estate seguro.
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteForeverIcon />}
              onClick={() => setDeleteDialogOpen(true)}
              fullWidth={isMobile}
            >
              Eliminar mi cuenta
            </Button>
          </Paper>
        </Stack>

        {/* Diálogo de confirmación de eliminación */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>¿Estás seguro?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Esta acción no se puede deshacer. Se eliminarán permanentemente todos tus datos, eventos, ventas y
              configuraciones.
            </DialogContentText>
            <DialogContentText sx={{ mt: 2, fontWeight: 'bold' }}>
              Para confirmar, escribe <strong>ELIMINAR</strong> en el campo de abajo:
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              fullWidth
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="ELIMINAR"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleDeleteAccount}
              color="error"
              variant="contained"
              disabled={deleteConfirmText !== 'ELIMINAR'}
            >
              Eliminar cuenta
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </BackofficeLayout>
  );
}
