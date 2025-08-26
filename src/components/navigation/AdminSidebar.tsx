'use client';

import { type FC, useMemo, useState } from 'react';
import {
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  Divider,
  ListItemButton,
  Box,
  Typography,
  Collapse,
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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


  const drawer = (
    <div>
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700 }}>
          Admin Panel
        </Typography>
      </Box>
      <Divider />
      <List onClick={onClose} sx={{ px: 0.5 }}>
        {items.map((it) => {
          const Icon = it.icon;
          const selected = it.href ? pathname === it.href : false;
          if (it.children && it.children.length > 0) {
            const open = openMap[it.key] ?? false;
            return (
              <Box key={it.key}>
                <ListItemButton onClick={() => toggle(it.key)} sx={{ mx: 0.5, my: 0.25, borderRadius: 1 }}>
                  {Icon && (
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Icon />
                    </ListItemIcon>
                  )}
                  <ListItemText primary={it.label} />
                  {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemButton>
                <Collapse in={open} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {it.children.map((child) => (
                      <ListItemButton
                        key={child.key}
                        component={Link}
                        href={child.href!}
                        selected={pathname === child.href}
                        sx={{ pl: 3, mx: 0.5, my: 0.25, borderRadius: 1 }}
                      >
                        {child.icon && (
                          <ListItemIcon sx={{ minWidth: 36 }}>
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
            <ListItemButton
              key={it.key}
              component={Link}
              href={it.href!}
              selected={selected}
              sx={{ mx: 0.5, my: 0.25, borderRadius: 1 }}
            >
              {Icon && (
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Icon />
                </ListItemIcon>
              )}
              <ListItemText primary={it.label} />
            </ListItemButton>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }} aria-label="admin navigation">
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            top: { xs: 56, sm: 64 },
            height: { xs: 'calc(100% - 56px)', sm: 'calc(100% - 64px)' },
          },
        }}
      >
        {drawer}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            top: 64,
            height: 'calc(100% - 64px)',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default AdminSidebar;