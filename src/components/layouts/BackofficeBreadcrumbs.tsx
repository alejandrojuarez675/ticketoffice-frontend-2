// src/components/layouts/BackofficeBreadcrumbs.tsx
'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { Link as MuiLink, Typography, Box } from '@mui/material';
import { ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems, type NavItem } from '@/config/backofficeNav';
import { EventService } from '@/services/EventService';

function flattenNav(items: NavItem[]) {
  const map = new Map<string, string>();
  const walk = (list: NavItem[]) => {
    for (const it of list) {
      if (it.href) map.set(it.href, it.label);
      if (it.children?.length) walk(it.children);
    }
  };
  walk(items);
  return map;
}

const staticLabels: Record<string, string> = {
  admin: 'Admin',
  dashboard: 'Panel',
  profile: 'Mi perfil',
  events: 'Eventos',
  new: 'Nuevo',
  edit: 'Editar',
  validate: 'Validar',
  sales: 'Ventas',
  coupons: 'Cupones',
  reports: 'Reportes',
  users: 'Vendedores',
  settings: 'Configuración',
};

export default function BackofficeBreadcrumbs() {
  const pathname = usePathname();
  const flat = useMemo(() => flattenNav(navItems), []);
  const parts = useMemo(() => (pathname || '').split('/').filter(Boolean), [pathname]);
  const [eventName, setEventName] = useState<string>('');

  // Detectar si estamos en la ruta de detalle de evento y obtener el nombre
  useEffect(() => {
    const isEventDetail = pathname?.match(/^\/admin\/events\/([a-f0-9-]+)(?:\/|$)/);
    if (isEventDetail && isEventDetail[1]) {
      const eventId = isEventDetail[1];
      EventService.getEventById(eventId)
        .then((event) => setEventName(event.title || ''))
        .catch(() => setEventName(''));
    } else {
      setEventName('');
    }
  }, [pathname]);

  const crumbs = parts.map((_, idx) => {
    const href = '/' + parts.slice(0, idx + 1).join('/');
    const last = idx === parts.length - 1;

    let label = flat.get(href);
    if (!label) {
      const seg = parts[idx];
      // Si es un UUID y estamos en /admin/events/[id], usar el nombre del evento
      if (seg.match(/^[a-f0-9-]{36}$/) && pathname?.includes('/admin/events/') && eventName) {
        label = eventName;
      } else {
        label = staticLabels[seg] || (seg.match(/^\\[?.+\\]?$/) ? 'Detalle' : decodeURIComponent(seg));
      }
    }

    return { href, label, last };
  });

  if (crumbs.length <= 1) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
      {crumbs.map((c) => (
        <React.Fragment key={c.href}>
          {c.last ? (
            <Typography 
              sx={{ 
                color: 'rgba(212, 212, 216, 1)',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {c.label}
            </Typography>
          ) : (
            <>
              <MuiLink 
                component={Link} 
                href={c.href} 
                underline="hover"
                sx={{
                  color: 'rgba(113, 113, 122, 1)',
                  fontSize: '0.875rem',
                  '&:hover': { color: 'rgba(161, 161, 170, 1)' },
                }}
              >
                {c.label}
              </MuiLink>
              <ChevronRightIcon sx={{ fontSize: '1rem', color: 'rgba(63, 63, 70, 1)' }} />
            </>
          )}
        </React.Fragment>
      ))}
    </Box>
  );
}
