// src/hooks/usePermissions.ts
'use client';

import { useMemo } from 'react';
import { useAuth } from '../app/contexts/AuthContext';
import { permissionsForRole, can, canAny, type Permission } from '@/lib/permissions';
import type { BackofficeRole } from '@/config/backofficeNav';

/**
 * [F5-002] usePermissions - Hook para verificar permisos del usuario
 * 
 * GUÍA: Este hook proporciona funciones para verificar roles y permisos
 * basados en el usuario autenticado.
 * 
 * Permisos disponibles definidos en src/lib/permissions.ts
 * 
 * Uso:
 * ```tsx
 * const { hasRole, hasPermission, isAdmin, isSeller } = usePermissions();
 * 
 * // Verificar rol
 * if (hasRole('admin')) { ... }
 * 
 * // Verificar permiso específico
 * if (hasPermission('events.create_any')) { ... }
 * 
 * // Shortcuts
 * if (isAdmin) { ... }
 * if (isSeller) { ... }
 * ```
 */
export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth();

  // Obtener permisos del rol actual
  const permissions = useMemo(() => {
    if (!user?.role) return [];
    return permissionsForRole(user.role as BackofficeRole);
  }, [user?.role]);

  /**
   * Verifica si el usuario tiene un rol específico
   */
  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   */
  const hasAnyRole = (roles: string[]): boolean => {
    return user?.role ? roles.includes(user.role) : false;
  };

  /**
   * [F5-002] Verifica si el usuario tiene un permiso específico
   * 
   * GUÍA: Los permisos disponibles son:
   * - Admin: dashboard.read_global, events.read_all, events.create_any, etc.
   * - Seller: dashboard.read_self, events.read_self, events.create_self, etc.
   */
  const hasPermission = (permission: Permission): boolean => {
    return can(permissions, permission);
  };

  /**
   * Verifica si el usuario tiene alguno de los permisos especificados
   */
  const hasAnyPermission = (permList: Permission[]): boolean => {
    return canAny(permissions, permList);
  };

  // Shortcuts comunes
  const isAdmin = hasRole('admin');
  const isSeller = hasRole('seller');

  /**
   * Verifica si el usuario puede acceder a su propio recurso o a todos (admin)
   * Útil para verificar acceso a eventos, ventas, etc.
   */
  const canAccessResource = (resourceOwnerId: number | undefined): boolean => {
    if (isAdmin) return true;
    if (!user?.id || resourceOwnerId == null) return false;
    return user.id === resourceOwnerId;
  };

  return {
    // Estado
    isAuthenticated,
    permissions,
    
    // Verificadores de rol
    hasRole,
    hasAnyRole,
    isAdmin,
    isSeller,
    
    // Verificadores de permiso
    hasPermission,
    hasAnyPermission,
    
    // Helpers
    canAccessResource,
  };
};
