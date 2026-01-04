// src/components/navigation/Navbar.tsx
'use client';

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type NavbarProps = { onMenuClick?: () => void };

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { isAuthenticated, hasBackofficeAccess, logout, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const pathname = usePathname();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const buttonId = 'navbar-account-button';
  const menuId = 'navbar-account-menu';

  const [guestAnchorEl, setGuestAnchorEl] = useState<null | HTMLElement>(null);
  const guestMenuOpen = Boolean(guestAnchorEl);
  const openGuestMenu = (e: React.MouseEvent<HTMLElement>) => setGuestAnchorEl(e.currentTarget);
  const closeGuestMenu = () => setGuestAnchorEl(null);

  const handleMenu = useCallback((event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget), []);
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
    if (pathname?.startsWith('/admin')) router.replace('/auth/login');
    else router.refresh();
  }, [handleClose, logout, pathname, router]);

  const avatarLetter = useMemo(() => (user?.name ? user.name.charAt(0).toUpperCase() : 'U'), [user?.name]);

  const isEventsActive = pathname?.startsWith('/events');
  
  // Determinar si estamos en una página de backoffice
  const isBackofficePage = pathname?.startsWith('/admin');

  return (
    <AppBar position="fixed" color="default" elevation={0}>
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <Box
            component={Link}
            href="/"
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              textDecoration: 'none', 
              color: 'inherit',
              mr: 2 
            }}
          >
            <Box
              component="img"
              src="/LogoFigma2-1.svg"
              alt="TuEntradaYa"
              sx={{ height: 40, width: 'auto' }}
            />
          </Box>

          {!isMobile && !isEventsActive && (
            <Box sx={{ display: 'flex', ml: 2 }}>
              <Button component={Link} href="/events" color="inherit">
                Eventos
              </Button>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!isMobile && isAuthenticated && hasBackofficeAccess && (
            <Button
              component={Link}
              href="/admin/events/new"
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineIcon />}
            >
              Crear evento
            </Button>
          )}
          {/* Botón de menú para sidebar en mobile (solo en backoffice) */}
          {isMobile && isAuthenticated && hasBackofficeAccess && isBackofficePage && onMenuClick && (
            <IconButton 
              size="large" 
              edge="start" 
              color="inherit" 
              aria-label="abrir menú" 
              sx={{ mr: 1 }} 
              onClick={onMenuClick}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          {/* Menú para invitados en mobile */}
          {isMobile && !isAuthenticated && (
            <>
              <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 1 }} onClick={openGuestMenu}>
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={guestAnchorEl}
                open={guestMenuOpen}
                onClose={closeGuestMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              >
                <MenuItem component={Link} href="/events" onClick={closeGuestMenu}>
                  <ListItemText>Todos los eventos</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem component={Link} href="/auth/login" onClick={closeGuestMenu}>
                  <ListItemText>Iniciar Sesión</ListItemText>
                </MenuItem>
                <MenuItem component={Link} href="/auth/register" onClick={closeGuestMenu}>
                  <ListItemText>Registrarse</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}

          {isAuthenticated ? (
            <>
              {isMobile && hasBackofficeAccess && (
                <Tooltip title="Crear evento">
                  <IconButton component={Link} href="/admin/events/new" size="large" color="primary" aria-label="Crear evento" sx={{ mr: 1 }}>
                    <AddCircleOutlineIcon />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="Cuenta">
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
                {hasBackofficeAccess && (
                  <MenuItem component={Link} href="/admin/events/new" onClick={handleClose}>
                    <ListItemIcon>
                      <AddCircleOutlineIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Crear evento</ListItemText>
                  </MenuItem>
                )}
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={handleProfile} disabled={!hasBackofficeAccess}>
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Mi perfil</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleSettings} disabled={!hasBackofficeAccess}>
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
            </>
          ) : (
            !isMobile && (
              <>
                <Button component={Link} href="/auth/login" color="inherit">
                  Iniciar Sesión
                </Button>
                <Button component={Link} href="/auth/register" variant="contained" color="primary" sx={{ ml: 1 }}>
                  Registrarse
                </Button>
              </>
            )
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}