'use client';

import React, { useState, useEffect } from 'react';
import LightLayout from '@/components/layouts/LightLayout';
import AuthShell from '@/components/auth/AuthShell';
import SubmitButton from '@/components/forms/SubmitButton';
import { TextField, Alert, Link as MuiLink, FormControlLabel, Checkbox } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/admin/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const onChange =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = key === 'acceptTerms' ? e.target.checked : e.target.value;
      setForm((f) => ({ ...f, [key]: value as any }));
    };

  const onSubmit = async (e: React.FormEvent) => {
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
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LightLayout title="Registro - TicketOffice">
      <AuthShell
        title="Crear cuenta"
        footer={
          <MuiLink component={Link} href="/auth/login" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
            ¿Ya tienes cuenta? Inicia sesión
          </MuiLink>
        }
      >
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={onSubmit}>
          <TextField fullWidth margin="normal" required label="Usuario" value={form.username} onChange={onChange('username')} disabled={submitting || isLoading} />
          <TextField fullWidth margin="normal" required label="Nombre" value={form.firstName} onChange={onChange('firstName')} disabled={submitting || isLoading} />
          <TextField fullWidth margin="normal" required label="Apellido" value={form.lastName} onChange={onChange('lastName')} disabled={submitting || isLoading} />
          <TextField fullWidth margin="normal" required type="email" label="Email" value={form.email} onChange={onChange('email')} disabled={submitting || isLoading} />
          <TextField fullWidth margin="normal" required type="password" label="Contraseña" value={form.password} onChange={onChange('password')} disabled={submitting || isLoading} />
          <TextField fullWidth margin="normal" required type="password" label="Confirmar contraseña" value={form.confirmPassword} onChange={onChange('confirmPassword')} disabled={submitting || isLoading} />
          <FormControlLabel control={<Checkbox checked={form.acceptTerms} onChange={onChange('acceptTerms')} />} label="Acepto los términos y condiciones" />
          <SubmitButton type="submit" fullWidth variant="contained" sx={{ mt: 2 }} loading={submitting || isLoading}>
            Crear cuenta
          </SubmitButton>
        </form>
      </AuthShell>
    </LightLayout>
  );
}
