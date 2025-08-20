import { type FC } from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Toolbar, 
  ListItemButton,
  useTheme,
  Box,
  Typography,
  Collapse
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  QrCodeScanner as QrCodeScannerIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type AdminSidebarProps = {
  mobileOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
};

const drawerWidth = 240;

const AdminSidebar: FC<AdminSidebarProps> = ({ mobileOpen, isMobile, onClose }) => {
  const theme = useTheme();
  const pathname = usePathname();
  const [openEvents, setOpenEvents] = useState(true);

  const handleEventsClick = () => {
    setOpenEvents(!openEvents);
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          Admin Panel
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItemButton 
          component={Link} 
          href="/admin/dashboard"
          selected={pathname === '/admin/dashboard'}
        >
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        <ListItemButton onClick={handleEventsClick}>
          <ListItemIcon>
            <EventIcon />
          </ListItemIcon>
          <ListItemText primary="Eventos" />
          {openEvents ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>
        
        <Collapse in={openEvents} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton 
              component={Link} 
              href="/admin/events"
              selected={pathname === '/admin/events'}
              sx={{ pl: 4 }}
            >
              <ListItemText primary="Todos los eventos" />
            </ListItemButton>
            <ListItemButton 
              component={Link} 
              href="/admin/events/new"
              selected={pathname === '/admin/events/new'}
              sx={{ pl: 4 }}
            >
              <ListItemText primary="Nuevo evento" />
            </ListItemButton>
          </List>
        </Collapse>

        <ListItemButton 
          component={Link} 
          href="/admin/validate"
          selected={pathname?.startsWith('/admin/validate')}
        >
          <ListItemIcon>
            <QrCodeScannerIcon />
          </ListItemIcon>
          <ListItemText primary="Validar Entradas" />
        </ListItemButton>

        <ListItemButton 
          component={Link} 
          href="/admin/users"
          selected={pathname === '/admin/users'}
        >
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Vendedores" />
        </ListItemButton>
      </List>
      
      <Divider sx={{ my: 1 }} />
      
      <List>
        <ListItemButton 
          component={Link} 
          href="/admin/settings"
          selected={pathname === '/admin/settings'}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Configuración" />
        </ListItemButton>
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default AdminSidebar;
