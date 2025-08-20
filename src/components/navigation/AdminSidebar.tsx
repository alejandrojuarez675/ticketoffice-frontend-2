// src/components/navigation/AdminSidebar.tsx
'use client';
import { type FC, useState } from 'react';
import { Drawer, List, ListItemIcon, ListItemText, Divider, Toolbar, ListItemButton, Box, Typography, Collapse } from '@mui/material';
import { Dashboard as DashboardIcon, Event as EventIcon, People as PeopleIcon, Settings as SettingsIcon, ExpandLess as ExpandLessIcon, ExpandMore as ExpandMoreIcon, QrCodeScanner as QrCodeScannerIcon } from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type AdminSidebarProps = { mobileOpen: boolean; isMobile: boolean; onClose: () => void };

const AdminSidebar: FC<AdminSidebarProps> = ({ mobileOpen, onClose }) => {
  const drawerWidth = 240;
  const pathname = usePathname();
  const [openEvents, setOpenEvents] = useState(true);

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          Admin Panel
        </Typography>
      </Toolbar>
      <Divider />
      <List onClick={onClose}>
        <ListItemButton component={Link} href="/admin/dashboard" selected={pathname === '/admin/dashboard'}>
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        <ListItemButton onClick={() => setOpenEvents((v) => !v)}>
          <ListItemIcon><EventIcon /></ListItemIcon>
          <ListItemText primary="Eventos" />
          {openEvents ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>

        <Collapse in={openEvents} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton component={Link} href="/admin/events" selected={pathname === '/admin/events'} sx={{ pl: 4 }}>
              <ListItemText primary="Todos los eventos" />
            </ListItemButton>
            <ListItemButton component={Link} href="/admin/events/new" selected={pathname === '/admin/events/new'} sx={{ pl: 4 }}>
              <ListItemText primary="Nuevo evento" />
            </ListItemButton>
          </List>
        </Collapse>

        <ListItemButton component={Link} href="/admin/validate" selected={pathname?.startsWith('/admin/validate')}>
          <ListItemIcon><QrCodeScannerIcon /></ListItemIcon>
          <ListItemText primary="Validar Entradas" />
        </ListItemButton>

        <ListItemButton component={Link} href="/admin/users" selected={pathname === '/admin/users'}>
          <ListItemIcon><PeopleIcon /></ListItemIcon>
          <ListItemText primary="Vendedores" />
        </ListItemButton>
      </List>

      <Divider sx={{ my: 1 }} />

      <List onClick={onClose}>
        <ListItemButton component={Link} href="/admin/settings" selected={pathname === '/admin/settings'}>
          <ListItemIcon><SettingsIcon /></ListItemIcon>
          <ListItemText primary="Configuración" />
        </ListItemButton>
      </List>
    </div>
  );

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="admin navigation">
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
      >
        {drawer}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default AdminSidebar;

