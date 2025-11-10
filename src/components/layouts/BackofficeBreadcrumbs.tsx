// src/components/layouts/BackofficeBreadcrumbs.tsx
'use client';

import React, { useMemo } from 'react';
import { Breadcrumbs, Link as MuiLink, Typography } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems, type NavItem } from '@/config/backofficeNav';

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

  const crumbs = parts.map((_, idx) => {
    const href = '/' + parts.slice(0, idx + 1).join('/');
    const last = idx === parts.length - 1;

    let label = flat.get(href);
    if (!label) {
      const seg = parts[idx];
      label = staticLabels[seg] || (seg.match(/^\\[?.+\\]?$/) ? 'Detalle' : decodeURIComponent(seg));
    }

    return { href, label, last };
  });

  if (crumbs.length <= 1) return null;

  return (
    <Breadcrumbs aria-label="breadcrumbs" sx={{ mb: 2 }}>
      {crumbs.map((c) =>
        c.last ? (
          <Typography key={c.href} color="text.primary">
            {c.label}
          </Typography>
        ) : (
          <MuiLink key={c.href} component={Link} href={c.href} underline="hover" color="inherit">
            {c.label}
          </MuiLink>
        )
      )}
    </Breadcrumbs>
  );
}
