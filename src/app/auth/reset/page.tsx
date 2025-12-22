// src/app/auth/reset/page.tsx
'use client';

import React, { Suspense, useMemo, useState } from 'react';
import LightLayout from '@/components/layouts/LightLayout';
import AuthShell from '@/components/auth/AuthShell';
import SubmitButton from '@/components/forms/SubmitButton';
import PasswordField from '@/components/forms/PasswordField';
import PasswordStrengthBar from '@/components/forms/PasswordStrengthBar';
import { Alert, Link as MuiLink, Box, Typography } from '@mui/material';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { z } from 'zod';
import { hasLower, hasNumber, hasUpper, getPasswordStrength, meetsBasicPasswordRules } from '@/utils/password';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthService } from '@/services/AuthService';
import { useSnackbar } from '@/components/forms/SnackbarProvider';

const Schema = z
  .object({
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .refine((s) => hasLower(s), 'Debe incluir minúsculas')
      .refine((s) => hasUpper(s), 'Debe incluir mayúsculas')
      .refine((s) => hasNumber(s), 'Debe incluir números'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, { message: 'Las contraseñas no coinciden', path: ['confirmPassword'] });

type Data = z.infer<typeof Schema>;

function ResetPasswordContent() {
  const sp = useSearchParams();
  const token = sp.get('token');
  const router = useRouter();
  const { showSnack } = useSnackbar();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Data>({ resolver: zodResolver(Schema), defaultValues: { password: '', confirmPassword: '' } });

  const pwd = useWatch({ control, name: 'password', defaultValue: '' });
  const strength = useMemo(() => getPasswordStrength(pwd), [pwd]);

  const [pwdFocused, setPwdFocused] = useState(false);
  const showHints = pwdFocused || pwd.length > 0;

  const rules = [
    { ok: pwd.length >= 8, label: 'Mínimo 8 caracteres' },
    { ok: hasLower(pwd), label: 'Al menos una minúscula' },
    { ok: hasUpper(pwd), label: 'Al menos una mayúscula' },
    { ok: hasNumber(pwd), label: 'Al menos un número' },
  ];

  const onSubmit = async (data: Data) => {
    try {
      if (!token) throw new Error('Token inválido');
      if (!meetsBasicPasswordRules(data.password)) return;
      await AuthService.resetPassword(token, data.password);
      showSnack({ message: 'Contraseña restablecida. Inicia sesión.', severity: 'success' });
      router.replace('/auth/login');
    } catch {
      // MVP: función no disponible en BE; notificamos y llevamos a login
      showSnack({ message: 'Función no disponible en el MVP. Usa el inicio de sesión.', severity: 'info' });
      router.replace('/auth/login');
    }
  };

  return (
    <LightLayout title="Restablecer contraseña - TuEntradaYa">
      <AuthShell
        title="Restablecer contraseña"
        footer={
          <MuiLink component={Link} href="/auth/login" underline="hover">
            Volver a iniciar sesión
          </MuiLink>
        }
      >
        {!token && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Token inválido.
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <PasswordField
                  fullWidth
                  label="Nueva contraseña"
                  autoComplete="new-password"
                  {...field}
                  onFocus={() => setPwdFocused(true)}
                  onBlur={(e) => {
                    field.onBlur();
                    setPwdFocused(false);
                  }}
                  error={!!fieldState.error}
                  helperText={showHints ? fieldState.error?.message ?? 'Mínimo 8 caracteres, incluir mayúsculas, minúsculas y números.' : ' '}
                  disabled={isSubmitting || !token}
                />
                {showHints && (
                  <>
                    <PasswordStrengthBar strength={strength} />
                    <Box sx={{ mt: 1 }}>
                      {rules.map((r) => (
                        <Typography key={r.label} variant="caption" sx={{ display: 'block', color: r.ok ? 'success.main' : 'text.secondary' }}>
                          • {r.label}
                        </Typography>
                      ))}
                    </Box>
                  </>
                )}
              </>
            )}
          />

          <PasswordField
            fullWidth
            label="Confirmar contraseña"
            autoComplete="new-password"
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message ?? ' '}
            disabled={isSubmitting || !token}
          />

          <SubmitButton type="submit" fullWidth variant="contained" loading={isSubmitting} disabled={!token}>
            Restablecer
          </SubmitButton>
        </form>
      </AuthShell>
    </LightLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
