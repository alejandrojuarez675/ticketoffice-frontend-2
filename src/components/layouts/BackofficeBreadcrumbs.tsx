// src/components/layouts/BackofficeBreadcrumbs.tsx
'use client';

import React, { useMemo } from 'react';
import { Breadcrumbs, Link as MuiLink, Typography } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems, type NavItem } from '@/config/backofficeNav';

// Aplana navItems a un mapa href->label
function flattenNav(items: NavItem[], parent: string[] = []) {
  const map = new Map<string, string>();
  for (const it of items) {
    if (it.href) map.set(it.href, it.label);
    if (it.children?.length) {
      for (const [k, v] of flattenNav(it.children, parent.concat(it.key))) map.set(k, v);
    }
  }
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

  // Construye los crumbs progresivamente
  const crumbs = parts.map((_, idx) => {
    const href = '/' + parts.slice(0, idx + 1).join('/');
    const last = idx === parts.length - 1;
    
    let label = flat.get(href);
    if (!label) {
      const seg = parts[idx];
      label = staticLabels[seg] || (seg.match(/^\[?.+\]?$/) ? 'Detalle' : decodeURIComponent(seg));
    }

    return { href, label, last };
  });

  // Evita renderizar en páginas raíz
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