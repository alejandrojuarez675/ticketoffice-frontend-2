
// src/hooks/usePermissions.ts
'use client';

import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { permissionsForRole, can as _can, canAny as _canAny } from '@/lib/permissions';
import type { BackofficeRole } from '@/config/backofficeNav';

export function usePermissions() {
  const { isAdmin, isSeller } = useAuth();
  const role: BackofficeRole | null = isAdmin ? 'admin' : isSeller ? 'seller' : null;
  const permissions = useMemo(() => permissionsForRole(role), [role]);
  const can = (perm: string) => _can(permissions, perm);
  const canAny = (list: string[]) => _canAny(permissions, list);
  return { role, permissions, can, canAny };
}