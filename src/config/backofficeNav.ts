import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Event as EventIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  ListAlt as ListAltIcon,
  QrCodeScanner as QrCodeScannerIcon,
  BarChart as BarChartIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

export type BackofficeRole = 'admin' | 'seller';

export type NavItem = {
  key: string;
  label: string;
  href?: string;
  icon?: React.ElementType;
  roles: BackofficeRole[];
  children?: NavItem[];
};

export const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Panel', href: '/admin/dashboard', icon: DashboardIcon, roles: ['admin'] },
  { key: 'profile', label: 'Mi perfil', href: '/admin/profile', icon: PersonIcon, roles: ['seller', 'admin'] },
  {
    key: 'events',
    label: 'Eventos',
    icon: EventIcon,
    roles: ['seller', 'admin'],
    children: [
      { key: 'events_all', label: 'Todos los eventos', href: '/admin/events', icon: ListAltIcon, roles: ['seller', 'admin'] },
      { key: 'events_new', label: 'Nuevo evento', href: '/admin/events/new', icon: AddCircleOutlineIcon, roles: ['seller', 'admin'] },
    ],
  },
  { key: 'validate', label: 'Validar Entradas', href: '/admin/validate', icon: QrCodeScannerIcon, roles: ['seller', 'admin'] },
  { key: 'reports', label: 'Reportes', href: '/admin/reports', icon: BarChartIcon, roles: ['seller', 'admin'] },
  { key: 'users', label: 'Vendedores', href: '/admin/users', icon: PeopleIcon, roles: ['admin'] },
  { key: 'settings', label: 'Configuración', href: '/admin/settings', icon: SettingsIcon, roles: ['admin'] },
];