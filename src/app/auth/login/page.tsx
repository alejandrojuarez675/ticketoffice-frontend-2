'use client';

import React, { Suspense, useEffect, useRef } from 'react';
import LightLayout from '@/components/layouts/LightLayout';
import AuthShell from '@/components/auth/AuthShell';
import SubmitButton from '@/components/forms/SubmitButton';
import PasswordField from '@/components/forms/PasswordField';
import { TextField, Link as MuiLink, FormControlLabel, Checkbox, Box } from '@mui/material';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSnackbar } from '@/components/forms/SnackbarProvider';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const LoginSchema = z.object({
  username: z.string().trim().min(3, 'El usuario debe tener al menos 3 caracteres').max(50, 'Máximo 50 caracteres'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
  remember: z.boolean().optional(),
});
type LoginData = z.infer<typeof LoginSchema>;

const inputSx = {
  '& .MuiInputBase-input': { color: 'common.white', WebkitTextFillColor: 'white' },
  '& .MuiOutlinedInput-input': { color: 'common.white' },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.75)' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.35)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.6)' },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.light' },
  '& .MuiInputLabel-root.Mui-focused': { color: 'primary.light' },
};

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');
  const { isAuthenticated, isLoading, login, isAdmin, hasBackofficeAccess } = useAuth();
  const { showSnack } = useSnackbar();
  const attemptsRef = useRef({ count: 0, until: 0 });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { username: '', password: '', remember: true },
  });

  const computeDestination = () => {
    if (nextParam) return nextParam;
    if (hasBackofficeAccess) return isAdmin ? '/admin/dashboard' : '/admin/profile';
    return '/';
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(computeDestination());
    }
  }, [isAuthenticated, isLoading, router, hasBackofficeAccess, isAdmin]);

  const onSubmit = async (data: LoginData) => {
    const now = Date.now();
    if (attemptsRef.current.until > now) {
      const secs = Math.ceil((attemptsRef.current.until - now) / 1000);
      showSnack({ message: `Espera ${secs}s para volver a intentar.`, severity: 'warning' });
      return;
    }
    try {
      await login({ username: data.username, password: data.password, remember: data.remember });
      showSnack({ message: 'Sesión iniciada', severity: 'success' });
      router.replace(computeDestination());
    } catch {
      attemptsRef.current.count += 1;
      if (attemptsRef.current.count >= 5) {
        attemptsRef.current.until = Date.now() + 30_000;
        attemptsRef.current.count = 0;
      }
      showSnack({ message: 'Usuario o contraseña incorrectos', severity: 'error' });
    }
  };

  return (
    <AuthShell
      title="Iniciar Sesión"
      textColor="common.white"
      footer={
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <MuiLink component={Link} href="/auth/forgot" underline="hover" sx={{ color: 'primary.light' }} variant="body2">
            ¿Olvidaste tu contraseña?
          </MuiLink>
          <MuiLink component={Link} href="/auth/register" underline="hover" sx={{ color: 'primary.light' }} variant="body2">
            ¿No tienes cuenta? Regístrate
          </MuiLink>
        </Box>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          fullWidth
          margin="normal"
          label="Usuario"
          autoComplete="username"
          autoFocus
          {...register('username')}
          error={!!errors.username}
          helperText={errors.username?.message ?? ' '}
          disabled={isSubmitting || isLoading}
          sx={inputSx}
        />

        <PasswordField
          fullWidth
          margin="normal"
          label="Contraseña"
          autoComplete="current-password"
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message ?? ' '}
          disabled={isSubmitting || isLoading}
          sx={inputSx}
        />

        <FormControlLabel
          control={<Checkbox {...register('remember')} sx={{ color: 'rgba(255,255,255,0.7)' }} />}
          label="Mantener sesión iniciada"
          sx={{ color: 'rgba(255,255,255,0.85)' }}
        />

        <SubmitButton type="submit" fullWidth variant="contained" sx={{ mt: 1 }} loading={isSubmitting || isLoading}>
          Iniciar Sesión
        </SubmitButton>
      </form>
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