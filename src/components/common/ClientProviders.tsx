'use client';

import type { ReactNode } from 'react';
import { GlobalErrorBoundary } from './GlobalErrorBoundary';
import { MockModeIndicator } from './MockModeIndicator';
import { ThemeProvider } from '@/components/ThemeProvider/ThemeProvider';
import { AuthProvider } from '@/app/contexts/AuthContext';
import { RegionProvider } from '@/contexts/RegionContext';

interface ClientProvidersProps {
  children: ReactNode;
}

/**
 * ClientProviders - Envuelve la app con todos los providers del cliente
 * 
 * Incluye:
 * - GlobalErrorBoundary (captura errores críticos)
 * - AuthProvider (contexto de autenticación)
 * - ThemeProvider (tema de MUI)
 * - RegionProvider (contexto de regionalización - NO forzado, solo para preferencias)
 * - MockModeIndicator (indicador visual de modo mock - solo dev)
 * 
 * Nota sobre RegionProvider:
 * - NO fuerza selección al inicio (forceSelection=false)
 * - El usuario puede navegar libremente sin configurar región
 * - La región se solicita solo cuando es necesaria (ej: al comprar)
 * - Afecta solo formato de precios, horarios y opciones en formularios
 * - NO limita qué eventos puede ver el usuario
 */
export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <RegionProvider forceSelection={true}>
            {children}
            <MockModeIndicator />
          </RegionProvider>
        </ThemeProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
}

export default ClientProviders;