// src/hooks/usePermissions.ts
'use client';

import { useAuth } from '../app/contexts/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasRole = (role: string) => user?.role === role;
  const hasAnyRole = (roles: string[]) => (user?.role ? roles.includes(user.role) : false);

  // MVP: siempre true; ajusta cuando tengas permisos finos
  const hasPermission = (_permission: string) => true;

  return { hasRole, hasAnyRole, hasPermission };
};
