// src/components/navigation/AdminTopBar.tsx
'use client';

import { type FC, useState, useMemo, useCallback } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Avatar, Menu, MenuItem, ListItemIcon, ListItemText, Divider, Tooltip } from '@mui/material';
import { Menu as MenuIcon, Logout as LogoutIcon, AccountCircle as AccountCircleIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

type ResponsiveOffset = { xs?: number; sm?: number };
type AdminTopBarProps = { onMenuClick: () => void; topOffset?: number | ResponsiveOffset };
const drawerWidth = 240;

const AdminTopBar: FC<AdminTopBarProps> = ({ onMenuClick, topOffset = 0 }) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const buttonId = 'account-button';
  const menuId = 'account-menu';

  const handleMenu = useCallback((e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget), []);
  const handleClose = useCallback(() => setAnchorEl(null), []);
  const handleProfile = useCallback(() => {
    handleClose();
    router.push('/admin/profile');
  }, [handleClose, router]);
  const handleSettings = useCallback(() => {
    handleClose();
    router.push('/admin/settings');
  }, [handleClose, router]);
  const handleLogout = useCallback(async () => {
    handleClose();
    await logout();
    router.replace('/auth/login');
  }, [handleClose, logout, router]);

  const avatarLetter = useMemo(() => (user?.name ? user.name.charAt(0).toUpperCase() : 'U'), [user?.name]);

  const topXs = typeof topOffset === 'number' ? topOffset : topOffset?.xs ?? 0;
  const topSm = typeof topOffset === 'number' ? topOffset : topOffset?.sm ?? topXs;

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        bgcolor: 'background.paper',
        top: { xs: topXs, sm: topSm },
      }}
      color="default"
      elevation={1}
    >
      <Toolbar>
        <IconButton color="inherit" aria-label="Abrir menú lateral" edge="start" onClick={onMenuClick} sx={{ mr: 2, display: { sm: 'none' } }}>
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Panel de Administración
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Configuración de la cuenta">
            <IconButton
              id={buttonId}
              size="large"
              aria-label="Abrir menú de cuenta"
              aria-controls={open ? menuId : undefined}
              aria-haspopup="menu"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar alt={user?.name || 'Usuario'} src={user?.avatar} sx={{ width: 32, height: 32 }}>
                {avatarLetter}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            id={menuId}
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={open}
            onClose={handleClose}
            slotProps={{ list: { 'aria-labelledby': buttonId } }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {user?.name || 'Usuario'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email || 'usuario@ejemplo.com'}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Perfil</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleSettings}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Configuración</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Cerrar Sesión</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AdminTopBar;