// src/components/forms/SnackbarProvider.tsx
'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Alert, Snackbar } from '@mui/material';

/**
 * [F2-005] SnackbarProvider - Notificaciones toast globales
 * 
 * GUÍA: Este provider permite mostrar notificaciones desde cualquier componente.
 * Ya está integrado en ThemeProvider, no necesitas agregarlo de nuevo.
 * 
 * Uso:
 * ```tsx
 * import { useSnackbar } from '@/components/forms/SnackbarProvider';
 * 
 * const { showSnack } = useSnackbar();
 * 
 * // Mostrar éxito
 * showSnack({ message: 'Guardado exitosamente', severity: 'success' });
 * 
 * // Mostrar error
 * showSnack({ message: 'Error al guardar', severity: 'error', duration: 5000 });
 * ```
 */

type Snack = { 
  message: string; 
  severity?: 'success' | 'error' | 'info' | 'warning'; 
  duration?: number; // ms, default 3500
};

type Ctx = { showSnack: (s: Snack) => void };

const SnackbarCtx = createContext<Ctx | null>(null);

export function useSnackbar() {
  const ctx = useContext(SnackbarCtx);
  if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider');
  return ctx;
}

export default function SnackbarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [snack, setSnack] = useState<Snack>({ message: '', severity: 'info', duration: 3500 });

  const showSnack = useCallback((s: Snack) => {
    setSnack({ severity: 'info', duration: 3500, ...s });
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ showSnack }), [showSnack]);

  return (
    <SnackbarCtx.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        onClose={(_, reason) => {
          if (reason === 'clickaway') return;
          setOpen(false);
        }}
        autoHideDuration={snack.duration}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity ?? 'info'} variant="filled" onClose={() => setOpen(false)} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </SnackbarCtx.Provider>
  );
}
