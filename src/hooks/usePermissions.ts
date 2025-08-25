'use client';

import { useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { permissionsForRole, can as _can, canAny as _canAny } from '@/lib/permissions';
import type { BackofficeRole } from '@/config/backofficeNav';
import type { Permission } from '@/lib/permissions';

export function usePermissions() {
  const { isAdmin, isSeller } = useAuth();
  const role: BackofficeRole | null = isAdmin ? 'admin' : isSeller ? 'seller' : null;

  const permissions = useMemo(() => permissionsForRole(role), [role]);

  const can = useCallback((perm: Permission) => _can(permissions, perm), [permissions]);
  const canAny = useCallback((list: Permission[]) => _canAny(permissions, list), [permissions]);

  return { role, permissions, can, canAny };
}