'use client';

import type { ReactNode } from 'react';
import { GlobalErrorBoundary } from './GlobalErrorBoundary';
import { MockModeIndicator } from './MockModeIndicator';
import { ThemeProvider } from '@/components/ThemeProvider/ThemeProvider';
import { AuthProvider } from '@/app/contexts/AuthContext';

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
 * - MockModeIndicator (indicador visual de modo mock - solo dev)
 */
export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          {children}
          <MockModeIndicator />
        </ThemeProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
}

export default ClientProviders;

