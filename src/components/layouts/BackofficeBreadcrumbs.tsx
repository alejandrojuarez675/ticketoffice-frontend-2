'use client';
import { Breadcrumbs, Link as MuiLink, Typography } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const labels: Record<string, string> = {
  admin: 'Admin',
  dashboard: 'Panel',
  events: 'Eventos',
  new: 'Nuevo',
  edit: 'Editar',
  validate: 'Validar',
  reports: 'Reportes',
  users: 'Vendedores',
  settings: 'Configuración',
};

export default function BackofficeBreadcrumbs() {
  const pathname = usePathname();
  const parts = (pathname || '').split('/').filter(Boolean);

  const crumbs = parts.map((part, idx) => {
    const href = '/' + parts.slice(0, idx + 1).join('/');
    const isLast = idx === parts.length - 1;
    const label = labels[part] ?? decodeURIComponent(part);
    return isLast ? (
      <Typography key={href} color="text.primary">{label}</Typography>
    ) : (
      <MuiLink key={href} component={Link} href={href} underline="hover" color="inherit">
        {label}
      </MuiLink>
    );
  });

  if (crumbs.length <= 1) return null;
  return <Breadcrumbs sx={{ mb: 2 }}>{crumbs}</Breadcrumbs>;
}