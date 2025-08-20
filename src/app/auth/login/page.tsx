// src/app/auth/login/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import LightLayout from '@/components/layouts/LightLayout';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, TextField, Alert, Link as MuiLink } from '@mui/material';
import Link from 'next/link';
import AuthShell from '@/components/auth/AuthShell';
import SubmitButton from '@/components/forms/SubmitButton';
import { useAuth } from '@/hooks/useAuth';

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/admin/dashboard';
  const { isAuthenticated, isLoading, login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/admin/dashboard');
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) return setError('Por favor, complete todos los campos');
    try {
      setSubmitting(true);
      await login({ username, password });
      router.replace(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Iniciar Sesión"
      footer={
        <MuiLink component={Link} href="/auth/register" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
          ¿No tienes cuenta? Regístrate
        </MuiLink>
      }
    >
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField fullWidth margin="normal" required label="Usuario" autoComplete="username" autoFocus value={username} onChange={(e) => setUsername(e.target.value)} disabled={submitting} />
        <TextField fullWidth margin="normal" required label="Contraseña" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={submitting} />
        <SubmitButton type="submit" fullWidth variant="contained" sx={{ mt: 2 }} loading={submitting || isLoading}>
          Iniciar Sesión
        </SubmitButton>
      </Box>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <LightLayout title="Iniciar Sesión - TicketOffice">
      <Suspense fallback={null}>
        <LoginFormInner />
      </Suspense>
    </LightLayout>
  );
}