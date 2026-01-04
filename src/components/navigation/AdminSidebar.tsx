// src/components/navigation/AdminSidebar.tsx
'use client';

import { type FC, useMemo, useState } from 'react';
import { Drawer, List, ListItemIcon, ListItemText, ListItemButton, Box, Typography, Collapse } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type BackofficeRole } from '@/config/backofficeNav';
import { getNavFor, type NavItem } from '@/config/backofficeNav';
import { useAuth } from '@/hooks/useAuth';

type AdminSidebarProps = { mobileOpen: boolean; isMobile: boolean; onClose: () => void };

const AdminSidebar: FC<AdminSidebarProps> = ({ mobileOpen, onClose }) => {
  const drawerWidth = 240;
  const pathname = usePathname();
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({ events: true });

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isSeller = user?.role === 'seller';
  const role: BackofficeRole | null = isAdmin ? 'admin' : isSeller ? 'seller' : null;

  // Usa feature flags + roles
  const items = useMemo<NavItem[]>(() => {
    if (!role) return [];
    return getNavFor(role);
  }, [role]);

  const toggle = (key: string) => setOpenMap((m) => ({ ...m, [key]: !m[key] }));

  const drawer = (
    <div>
      <Box 
        sx={{ 
          px: 3, 
          py: 2.5,
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '4px',
            background: 'linear-gradient(to bottom right, rgba(124, 58, 237, 1), rgba(99, 102, 241, 1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.625rem',
            fontWeight: 700,
            color: 'white',
          }}
        >
          
        </Box>
        <Typography 
          variant="subtitle1" 
          noWrap 
          sx={{ 
            fontWeight: 700,
            fontSize: '1.125rem',
            letterSpacing: '-0.025em',
            color: 'white',
          }}
        >
          Admin Panel
        </Typography>
      </Box>
      <List onClick={onClose} sx={{ px: 1.5, py: 3 }}>
        {items.map((it) => {
          const Icon = it.icon as SvgIconComponent;
          const selected = it.href ? pathname === it.href : false;

          if (it.children && it.children.length > 0) {
            const open = openMap[it.key] ?? false;
            return (
              <Box key={it.key}>
                <ListItemButton 
                  onClick={() => toggle(it.key)} 
                  sx={{ 
                    mx: 0,
                    my: 0.25,
                    px: 1.5,
                    py: 1,
                    borderRadius: '8px',
                    backgroundColor: open ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  {Icon && (
                    <ListItemIcon sx={{ minWidth: 36, color: open ? 'rgba(167, 139, 250, 1)' : 'rgba(113, 113, 122, 1)' }}>
                      <Icon sx={{ fontSize: '1.125rem' }} />
                    </ListItemIcon>
                  )}
                  <ListItemText 
                    primary={it.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: open ? 'white' : 'rgba(161, 161, 170, 1)',
                    }}
                  />
                  {open ? 
                    <ExpandLessIcon sx={{ fontSize: '1rem', color: 'rgba(113, 113, 122, 1)' }} /> : 
                    <ExpandMoreIcon sx={{ fontSize: '1rem', color: 'rgba(113, 113, 122, 1)' }} />
                  }
                </ListItemButton>
                <Collapse in={open} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ mt: 0.5, ml: 2, pl: 2, borderLeft: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    {it.children.map((child) => {
                      const ChildIcon = child.icon;
                      const childSelected = pathname === child.href;
                      return (
                        <ListItemButton
                          key={child.key}
                          component={Link}
                          href={child.href!}
                          selected={childSelected}
                          sx={{ 
                            pl: 1.5,
                            pr: 1.5,
                            py: 1,
                            mx: 0,
                            my: 0.25,
                            borderRadius: '8px',
                            backgroundColor: childSelected ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                            border: childSelected ? '1px solid rgba(124, 58, 237, 0.2)' : '1px solid transparent',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: childSelected ? 'rgba(124, 58, 237, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            },
                          }}
                        >
                          {ChildIcon && (
                            <ListItemIcon sx={{ minWidth: 32, color: childSelected ? 'rgba(167, 139, 250, 1)' : 'rgba(113, 113, 122, 1)' }}>
                              <ChildIcon sx={{ fontSize: '1rem' }} />
                            </ListItemIcon>
                          )}
                          <ListItemText 
                            primary={child.label}
                            primaryTypographyProps={{
                              fontSize: '0.875rem',
                              fontWeight: childSelected ? 600 : 500,
                              color: childSelected ? 'rgba(167, 139, 250, 1)' : 'rgba(161, 161, 170, 1)',
                            }}
                          />
                        </ListItemButton>
                      );
                    })}
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
              sx={{ 
                mx: 0,
                my: 0.25,
                px: 1.5,
                py: 1,
                borderRadius: '8px',
                backgroundColor: selected ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                border: selected ? '1px solid rgba(124, 58, 237, 0.2)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: selected ? 'rgba(124, 58, 237, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              {Icon && (
                <ListItemIcon sx={{ minWidth: 36, color: selected ? 'rgba(167, 139, 250, 1)' : 'rgba(113, 113, 122, 1)' }}>
                  <Icon sx={{ fontSize: '1.125rem' }} />
                </ListItemIcon>
              )}
              <ListItemText 
                primary={it.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: selected ? 600 : 500,
                  color: selected ? 'rgba(167, 139, 250, 1)' : 'rgba(161, 161, 170, 1)',
                }}
              />
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
