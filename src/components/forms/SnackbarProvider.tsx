'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

type Snack = { message: string; severity?: 'success' | 'error' | 'info' | 'warning'; duration?: number };
type Ctx = { showSnack: (s: Snack) => void };

const SnackbarCtx = createContext<Ctx | null>(null);

export function useSnackbar() {
  const ctx = useContext(SnackbarCtx);
  if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider');
  return ctx;
}

export default function SnackbarProvider({ children }: { children: React.ReactNode }) {
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