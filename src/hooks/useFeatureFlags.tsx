'use client';

import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { FEATURES, type FeatureFlags } from '@/config/featureFlags';

/**
 * [F5-003] useFeatureFlags - Hook para verificar feature flags
 * 
 * GUÍA: Este hook permite verificar si una funcionalidad está habilitada.
 * Los flags se configuran en src/config/featureFlags.ts
 * 
 * Override por env vars (desarrollo):
 * - NEXT_PUBLIC_FF_DASHBOARD=true → habilita DASHBOARD
 * - NEXT_PUBLIC_FF_PROFILE=false → deshabilita PROFILE
 * 
 * Uso:
 * ```tsx
 * const { isFeatureEnabled, flags } = useFeatureFlags();
 * 
 * // Verificar un flag
 * if (isFeatureEnabled('PROFILE')) {
 *   // Mostrar perfil
 * }
 * 
 * // Renderizado condicional
 * {isFeatureEnabled('COUPONS') && <CouponsSection />}
 * ```
 */

// Obtener override de env vars
function getEnvOverride(flag: keyof FeatureFlags): boolean | null {
  if (typeof window === 'undefined') return null;
  
  const envKey = `NEXT_PUBLIC_FF_${flag}`;
  const value = process.env[envKey];
  
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
}

// Calcular flags con overrides
function getEffectiveFlags(): FeatureFlags {
  const effectiveFlags = { ...FEATURES };
  
  // Aplicar overrides de env vars
  (Object.keys(FEATURES) as Array<keyof FeatureFlags>).forEach(flag => {
    const override = getEnvOverride(flag);
    if (override !== null) {
      effectiveFlags[flag] = override;
    }
  });
  
  return effectiveFlags;
}

export function useFeatureFlags() {
  // Calcular flags efectivos (memoizado)
  const flags = useMemo(() => getEffectiveFlags(), []);

  /**
   * Verifica si un feature está habilitado
   */
  const isFeatureEnabled = (flag: keyof FeatureFlags): boolean => {
    return flags[flag] ?? false;
  };

  /**
   * Verifica si todos los features especificados están habilitados
   */
  const areAllFeaturesEnabled = (featureList: Array<keyof FeatureFlags>): boolean => {
    return featureList.every(flag => flags[flag]);
  };

  /**
   * Verifica si alguno de los features especificados está habilitado
   */
  const isAnyFeatureEnabled = (featureList: Array<keyof FeatureFlags>): boolean => {
    return featureList.some(flag => flags[flag]);
  };

  return {
    flags,
    isFeatureEnabled,
    areAllFeaturesEnabled,
    isAnyFeatureEnabled,
  };
}

/**
 * Componente wrapper para renderizado condicional basado en feature flag
 * 
 * Uso:
 * ```tsx
 * <FeatureGate flag="COUPONS">
 *   <CouponsSection />
 * </FeatureGate>
 * 
 * // Con fallback
 * <FeatureGate flag="REPORTS" fallback={<ComingSoon />}>
 *   <ReportsSection />
 * </FeatureGate>
 * ```
 */
interface FeatureGateProps {
  flag: keyof FeatureFlags;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({ flag, children, fallback = null }: FeatureGateProps) {
  const { isFeatureEnabled } = useFeatureFlags();
  
  if (!isFeatureEnabled(flag)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

export default useFeatureFlags;

