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

const inputSx = {
  '& .MuiInputBase-input': { color: 'common.white', WebkitTextFillColor: 'white' },
  '& .MuiOutlinedInput-input': { color: 'common.white' },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.75)' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.35)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.6)' },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.light' },
  '& .MuiInputLabel-root.Mui-focused': { color: 'primary.light' },
};

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
      showSnack({ message: 'No se pudo restablecer la contraseña', severity: 'error' });
    }
  };

  return (
    <LightLayout title="Restablecer contraseña - TicketOffice">
      <AuthShell
        title="Restablecer contraseña"
        textColor="common.white"
        footer={<MuiLink component={Link} href="/auth/login" underline="hover" sx={{ color: 'primary.light' }}>Volver a iniciar sesión</MuiLink>}
      >
        {!token && <Alert severity="error" sx={{ mb: 2 }}>Token inválido.</Alert>}

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
                  disabled={isSubmitting}
                  sx={inputSx}
                />
                {showHints && (
                  <>
                    <PasswordStrengthBar strength={strength} />
                    <Box sx={{ mt: 1 }}>
                      {rules.map((r) => (
                        <Typography key={r.label} variant="caption" sx={{ display: 'block', color: r.ok ? 'success.main' : 'rgba(255,255,255,0.7)' }}>
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
            disabled={isSubmitting}
            sx={inputSx}
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