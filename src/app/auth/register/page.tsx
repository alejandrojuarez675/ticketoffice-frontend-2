'use client';

import React, { useState, useEffect } from 'react';
import LightLayout from '@/components/layouts/LightLayout';
import { useRouter } from 'next/navigation';
import {
  Box, Container, Paper, TextField, Button, Typography, Alert, CircularProgress, Link as MuiLink, FormControlLabel, Checkbox,
} from '@mui/material';
import Link from 'next/link';
import { AuthService } from '@/services/AuthService';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const [form, setForm] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const disabled = submitting || isLoading;

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/admin/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = key === 'acceptTerms' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value as any }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.username || !form.firstName || !form.lastName || !form.email || !form.password || !form.confirmPassword) {
      setError('Por favor, complete todos los campos');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (!form.acceptTerms) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }

    try {
      setSubmitting(true);
      await AuthService.register(form);
      router.replace('/auth/login');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LightLayout title="Registro - TicketOffice">
      <Container component="main" maxWidth="xs">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Paper elevation={3} sx={{ p: 4, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="h1" variant="h5" gutterBottom>Crear cuenta</Typography>

            {error && <Alert severity="error" sx={{ width: '100%', mb: 3 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField margin="normal" required fullWidth label="Usuario" value={form.username} onChange={handleChange('username')} disabled={disabled} />
              <TextField margin="normal" required fullWidth label="Nombre" value={form.firstName} onChange={handleChange('firstName')} disabled={disabled} />
              <TextField margin="normal" required fullWidth label="Apellido" value={form.lastName} onChange={handleChange('lastName')} disabled={disabled} />
              <TextField margin="normal" required fullWidth label="Email" type="email" value={form.email} onChange={handleChange('email')} disabled={disabled} />
              <TextField margin="normal" required fullWidth label="Contraseña" type="password" value={form.password} onChange={handleChange('password')} disabled={disabled} />
              <TextField margin="normal" required fullWidth label="Confirmar contraseña" type="password" value={form.confirmPassword} onChange={handleChange('confirmPassword')} disabled={disabled} />
              <FormControlLabel
                control={<Checkbox checked={form.acceptTerms} onChange={handleChange('acceptTerms')} />}
                label="Acepto los términos y condiciones"
              />
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 2, mb: 2 }} disabled={disabled}>
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Crear cuenta'}
              </Button>
              <Typography variant="body2" textAlign="center" color="text.secondary">
                ¿Ya tienes cuenta?{' '}
                <MuiLink component={Link} href="/auth/login" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  Inicia sesión
                </MuiLink>
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </LightLayout>
  );
}
