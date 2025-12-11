// src/app/auth/login/page.tsx
'use client';

import React, { Suspense, useState, useEffect } from 'react';
import LightLayout from '@/components/layouts/LightLayout';
import { Box, Button, Container, TextField, Typography, Alert, Checkbox, FormControlLabel, Paper, CircularProgress } from '@mui/material';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// This component is wrapped in Suspense as a workaround for the useSearchParams()
// https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  // Redirigir al perfil por defecto después del login
  const next = sp.get('next') || '/admin/profile';

  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/admin/profile');
    }
  }, [authLoading, isAuthenticated, router]);

  // Mostrar loading mientras verifica autenticación
  if (authLoading) {
    return (
      <LightLayout title="Cargando...">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </LightLayout>
    );
  }

  // Si ya está autenticado, no mostrar nada (se está redirigiendo)
  if (isAuthenticated) {
    return null;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username || !password) {
      setError('Completa usuario y contraseña');
      return;
    }
    try {
      setLoading(true);
      await login({ username, password, remember });
      // Redirigir usando router.push para mejor UX
      router.push(next);
    } catch (error) {
      console.error('Login error:', error);
      setError('Credenciales inválidas. Por favor, verifica e intenta nuevamente.');
      setLoading(false);
    }
  };

  return (
    <LightLayout title="Iniciar sesión - TicketOffice">
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom>
            Iniciar sesión
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={onSubmit}>
            <TextField
              fullWidth
              label="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              autoComplete="username"
            />
            <TextField
              fullWidth
              type="password"
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              autoComplete="current-password"
            />
            <FormControlLabel
              control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} />}
              label="Recordarme"
              sx={{ mt: 1 }}
            />
            <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Ingresando...' : 'Ingresar'}
              </Button>
              <Button color="inherit" variant="text" href="/auth/forgot">
                Olvidé mi contraseña
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </LightLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <LightLayout title="Cargando...">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </LightLayout>
    }>
      <LoginForm />
    </Suspense>
  );
}
