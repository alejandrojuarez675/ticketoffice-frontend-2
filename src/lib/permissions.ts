import type { BackofficeRole } from '@/config/backofficeNav';

// Define permisos por rol con tipado literal
const rolePermissions = {
  admin: [
    'dashboard.read_global',
    'events.read_all',
    'events.create_any',
    'events.update_any',
    'events.delete_any',
    'sales.read_all',
    'validate.read_all',
    'users.read',
    'users.invite',
    'settings.read',
    'coupons.create_any',
  ] as const,
  seller: [
    'dashboard.read_self',
    'events.read_self',
    'events.create_self',
    'events.update_self',
    'events.delete_self',
    'sales.read_self',
    'validate.read_self',
    'coupons.create_self',
  ] as const,
} as const;

type RoleKey = keyof typeof rolePermissions; // 'admin' | 'seller'
export type Permission = (typeof rolePermissions)[RoleKey][number];

export function permissionsForRole(role: BackofficeRole | null | undefined): Permission[] {
  if (!role) return [];
  // devolvemos una copia por seguridad
  return [...rolePermissions[role]];
}

export function can(permissions: Permission[], perm: Permission) {
  return permissions.includes(perm);
}

export function canAny(permissions: Permission[], list: Permission[]) {
  return list.some((p) => permissions.includes(p));
}

// Útil si necesitas listar todos los permisos (diagnóstico/UI)
export const ALL_PERMISSIONS: Permission[] = Array.from(
  new Set<Permission>([...rolePermissions.admin, ...rolePermissions.seller] as Permission[])
);