import type { BackofficeRole } from '@/config/backofficeNav';

const rolePermissions: Record<BackofficeRole, string[]> = {
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
  ],
  seller: [
    'dashboard.read_self',
    'events.read_self',
    'events.create_self',
    'events.update_self',
    'events.delete_self',
    'sales.read_self',
    'validate.read_self',
    'coupons.create_self',
  ],
};

export function permissionsForRole(role: BackofficeRole | null | undefined): string[] {
  if (!role) return [];
  return rolePermissions[role] ?? [];
}

export function can(permissions: string[], perm: string) {
  return permissions.includes(perm);
}
export function canAny(permissions: string[], list: string[]) {
  return list.some((p) => permissions.includes(p));
}