// src/components/navigation/AdminSidebar.tsx
'use client';

import { type FC, useMemo, useState } from 'react';
import {
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  ListItemButton,
  Box,
  Typography,
  Collapse,
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems, type BackofficeRole, type NavItem } from '@/config/backofficeNav';
import { useAuth } from '@/hooks/useAuth';

type AdminSidebarProps = { mobileOpen: boolean; isMobile: boolean; onClose: () => void };

const AdminSidebar: FC<AdminSidebarProps> = ({ mobileOpen, onClose }) => {
  const drawerWidth = 240;
  const pathname = usePathname();
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({ events: true });

  const { isAdmin, isSeller } = useAuth();
  const role: BackofficeRole | null = isAdmin ? 'admin' : isSeller ? 'seller' : null;

  const items = useMemo<NavItem[]>(() => {
    if (!role) return [];
    const filterByRole = (list: NavItem[]): NavItem[] =>
      list
        .filter((i) => i.roles.includes(role))
        .map((i) => (i.children ? { ...i, children: filterByRole(i.children) } : i));
    return filterByRole(navItems);
  }, [role]);

  const toggle = (key: string) => setOpenMap((m) => ({ ...m, [key]: !m[key] }));

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const selected = item.href ? pathname === item.href : false;
    if (item.children && item.children.length > 0) {
      const open = openMap[item.key] ?? false;
      return (
        <Box key={item.key}>
          <ListItemButton onClick={() => toggle(item.key)}>
            {Icon && (
              <ListItemIcon>
                <Icon />
              </ListItemIcon>
            )}
            <ListItemText primary={item.label} />
            {open ? <span className="material-icons">expand_less</span> : <span className="material-icons">expand_more</span>}
          </ListItemButton>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child) => (
                <ListItemButton key={child.key} component={Link} href={child.href!} selected={pathname === child.href} sx={{ pl: 4 }}>
                  {child.icon && (
                    <ListItemIcon>
                      <child.icon />
                    </ListItemIcon>
                  )}
                  <ListItemText primary={child.label} />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </Box>
      );
    }
    return (
      <ListItemButton key={item.key} component={Link} href={item.href!} selected={selected}>
        {Icon && (
          <ListItemIcon>
            <Icon />
          </ListItemIcon>
        )}
        <ListItemText primary={item.label} />
      </ListItemButton>
    );
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          Admin Panel
        </Typography>
      </Toolbar>
      <Divider />
      <List onClick={onClose}>{items.map(renderItem)}</List>
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