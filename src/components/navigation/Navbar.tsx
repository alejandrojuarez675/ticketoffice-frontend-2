// src/components/navigation/Navbar.tsx
'use client';

import { AppBar, Toolbar, Typography, Button, Box, IconButton, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated, hasBackofficeAccess, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" component={Link} href="/" sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold', mr: 2 }}>
            TicketOffice
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', ml: 2 }}>
              <Button component={Link} href="/events">
                Eventos
              </Button>
              {hasBackofficeAccess && (
                <Button component={Link} href="/admin/dashboard">
                  Mi perfil
                </Button>
              )}
            </Box>
          )}
        </Box>

        {isMobile ? (
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
        ) : (
          <Box>
            {isAuthenticated ? (
              <Button color="inherit" onClick={logout}>
                Cerrar Sesión
              </Button>
            ) : (
              <>
                <Button component={Link} href="/auth/login" color="inherit">
                  Iniciar Sesión
                </Button>
                <Button component={Link} href="/auth/register" variant="contained" color="primary" sx={{ ml: 1 }}>
                  Registrarse
                </Button>
              </>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}