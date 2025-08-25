'use client';

import React, { useEffect, useMemo, useState } from 'react';
import LightLayout from '@/components/layouts/LightLayout';
import AuthShell from '@/components/auth/AuthShell';
import SubmitButton from '@/components/forms/SubmitButton';
import PasswordField from '@/components/forms/PasswordField';
import PasswordStrengthBar from '@/components/forms/PasswordStrengthBar';
import {
  TextField,
  Alert,
  Link as MuiLink,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  InputAdornment,
  Box,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/AuthService';
import { useAuth } from '@/hooks/useAuth';
import { useSnackbar } from '@/components/forms/SnackbarProvider';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { getPasswordStrength, hasLower, hasUpper, hasNumber, meetsBasicPasswordRules } from '@/utils/password';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Collapse from '@mui/material/Collapse';

const usernameRegex = /^[A-Za-z][A-Za-z0-9._]{2,19}$/;
const forbidRepeats = /(\.\.|__|_\.)/;
const nameRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]{2,50}$/;

const RegisterSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'El usuario debe tener al menos 3 caracteres')
      .max(20, 'Máximo 20 caracteres')
      .regex(usernameRegex, 'Solo letras, números, punto y guion bajo; debe iniciar con letra')
      .refine((s) => !forbidRepeats.test(s), 'Evita repeticiones de símbolos (.., __, _.)'),
    firstName: z.string().trim().min(2, 'Nombre demasiado corto').max(50, 'Nombre demasiado largo').regex(nameRegex, 'Nombre inválido'),
    lastName: z.string().trim().min(2, 'Apellido demasiado corto').max(50, 'Apellido demasiado largo').regex(nameRegex, 'Apellido inválido'),
    email: z.string().trim().email('Email inválido'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .refine((s) => hasLower(s), 'Debe incluir minúsculas')
      .refine((s) => hasUpper(s), 'Debe incluir mayúsculas')
      .refine((s) => hasNumber(s), 'Debe incluir números'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine(val => val === true, { message: 'Debes aceptar los términos y condiciones' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type RegisterData = z.infer<typeof RegisterSchema>;

// Estilo robusto para inputs blancos (incluye WebkitTextFillColor para Safari/Autofill)
const inputWhiteSx = {
  '& .MuiInputBase-input': { color: 'common.white', WebkitTextFillColor: 'white' },
  '& .MuiOutlinedInput-input': { color: 'common.white' },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.75)' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.35)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.6)' },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.light' },
  '& .MuiInputLabel-root.Mui-focused': { color: 'primary.light' },
};

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { showSnack } = useSnackbar();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/admin/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const passwordValue = useWatch({ control, name: 'password', defaultValue: '' });
  const strength = useMemo(() => getPasswordStrength(passwordValue), [passwordValue]);

  // Disponibilidad
  const usernameValue = useWatch({ control, name: 'username', defaultValue: '' });
  const emailValue = useWatch({ control, name: 'email', defaultValue: '' });
  const debouncedUser = useDebouncedValue(usernameValue, 500);
  const debouncedEmail = useDebouncedValue(emailValue, 500);
  const [userAvail, setUserAvail] = useState<'idle' | 'loading' | 'ok' | 'taken'>('idle');
  const [mailAvail, setMailAvail] = useState<'idle' | 'loading' | 'ok' | 'taken'>('idle');

  React.useEffect(() => {
    let active = true;
    (async () => {
      if (!debouncedUser || errors.username) {
        setUserAvail('idle');
        return;
      }
      try {
        setUserAvail('loading');
        const r = await AuthService.checkAvailability({ username: debouncedUser });
        if (!active) return;
        setUserAvail(r.usernameAvailable ? 'ok' : 'taken');
      } catch {
        if (active) setUserAvail('idle');
      }
    })();
    return () => {
      active = false;
    };
  }, [debouncedUser, errors.username]);

  React.useEffect(() => {
    let active = true;
    (async () => {
      if (!debouncedEmail || errors.email) {
        setMailAvail('idle');
        return;
      }
      try {
        setMailAvail('loading');
        const r = await AuthService.checkAvailability({ email: debouncedEmail });
        if (!active) return;
        setMailAvail(r.emailAvailable ? 'ok' : 'taken');
      } catch {
        if (active) setMailAvail('idle');
      }
    })();
    return () => {
      active = false;
    };
  }, [debouncedEmail, errors.email]);

  const [pwdFocused, setPwdFocused] = useState(false);
  const showPwdHints = pwdFocused || passwordValue.length > 0;

  const rules = [
    { ok: passwordValue.length >= 8, label: 'Mínimo 8 caracteres' },
    { ok: hasLower(passwordValue), label: 'Al menos una minúscula' },
    { ok: hasUpper(passwordValue), label: 'Al menos una mayúscula' },
    { ok: hasNumber(passwordValue), label: 'Al menos un número' },
  ];

  const onSubmit = async (data: RegisterData) => {
    try {
      if (!meetsBasicPasswordRules(data.password)) return;
      await AuthService.register({
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        acceptTerms: data.acceptTerms,
      });
      showSnack({ message: 'Cuenta creada con éxito. Inicia sesión para continuar.', severity: 'success' });
      router.replace('/auth/login');
    } catch (err) {
      showSnack({ message: err instanceof Error ? err.message : 'Error al registrarse', severity: 'error' });
    }
  };

  return (
    <LightLayout title="Registro - TicketOffice">
      <AuthShell
        title="Crear cuenta"
        footer={
          <MuiLink component={Link} href="/auth/login" underline="hover" sx={{ color: 'primary.light' }}>
            ¿Ya tienes cuenta? Inicia sesión
          </MuiLink>
        }
        textColor="common.white"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
          {errors.root && <Alert severity="error" sx={{ mb: 2 }}>{errors.root.message}</Alert>}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Usuario"
                autoComplete="off"
                {...register('username')}
                error={!!errors.username || userAvail === 'taken'}
                helperText={errors.username?.message ?? (userAvail === 'taken' ? 'Este usuario ya está en uso' : ' ')}
                disabled={isSubmitting || isLoading}
                sx={inputWhiteSx}
                slotProps={{
                  input: {
                    endAdornment:
                      userAvail === 'loading' ? (
                        <InputAdornment position="end">
                          <CircularProgress size={16} />
                        </InputAdornment>
                      ) : userAvail === 'ok' ? (
                        <InputAdornment position="end">
                          <CheckIcon color="success" fontSize="small" />
                        </InputAdornment>
                      ) : userAvail === 'taken' ? (
                        <InputAdornment position="end">
                          <CloseIcon color="error" fontSize="small" />
                        </InputAdornment>
                      ) : undefined,
                    inputProps: { autoComplete: 'off', style: { WebkitTextFillColor: 'white' } },
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Nombre"
                autoComplete="off"
                {...register('firstName')}
                error={!!errors.firstName}
                helperText={errors.firstName?.message ?? ' '}
                disabled={isSubmitting || isLoading}
                sx={inputWhiteSx}
                slotProps={{ input: { inputProps: { autoComplete: 'off', style: { WebkitTextFillColor: 'white' } } } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Apellido"
                autoComplete="off"
                {...register('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName?.message ?? ' '}
                disabled={isSubmitting || isLoading}
                sx={inputWhiteSx}
                slotProps={{ input: { inputProps: { autoComplete: 'off', style: { WebkitTextFillColor: 'white' } } } }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                autoComplete="email"
                {...register('email')}
                error={!!errors.email || mailAvail === 'taken'}
                helperText={errors.email?.message ?? (mailAvail === 'taken' ? 'Este correo ya está en uso' : ' ')}
                disabled={isSubmitting || isLoading}
                sx={inputWhiteSx}
                slotProps={{
                  input: {
                    endAdornment:
                      mailAvail === 'loading' ? (
                        <InputAdornment position="end">
                          <CircularProgress size={16} />
                        </InputAdornment>
                      ) : mailAvail === 'ok' ? (
                        <InputAdornment position="end">
                          <CheckIcon color="success" fontSize="small" />
                        </InputAdornment>
                      ) : mailAvail === 'taken' ? (
                        <InputAdornment position="end">
                          <CloseIcon color="error" fontSize="small" />
                        </InputAdornment>
                      ) : undefined,
                    inputProps: { autoComplete: 'email', style: { WebkitTextFillColor: 'white' } },
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <PasswordField
                      fullWidth
                      label="Contraseña"
                      autoComplete="new-password"
                      {...field}
                      onFocus={() => setPwdFocused(true)}
                      onBlur={(e) => {
                        field.onBlur();
                        setPwdFocused(false);
                      }}
                      error={!!fieldState.error}
                      helperText={
                        showPwdHints
                          ? fieldState.error?.message ?? 'Mínimo 8 caracteres, incluir mayúsculas, minúsculas y números.'
                          : ' '
                      }
                      disabled={isSubmitting || isLoading}
                      sx={inputWhiteSx}
                      slotProps={{ input: { inputProps: { autoComplete: 'new-password', style: { WebkitTextFillColor: 'white' } } } }}
                    />
                    {showPwdHints && (
                      <Collapse in={showPwdHints} timeout={200} unmountOnExit>
                        <PasswordStrengthBar strength={strength} />
                        <Box sx={{ mt: 1 }}>
                          {rules.map((r) => (
                            <Typography
                              key={r.label}
                              variant="caption"
                              sx={{ display: 'block', color: r.ok ? 'success.main' : 'rgba(255,255,255,0.7)' }}
                            >
                              • {r.label}
                            </Typography>
                          ))}
                        </Box>
                      </Collapse>
                    )}
                  </>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <PasswordField
                fullWidth
                label="Confirmar contraseña"
                autoComplete="new-password"
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message ?? ' '}
                disabled={isSubmitting || isLoading}
                sx={inputWhiteSx}
                slotProps={{ input: { inputProps: { autoComplete: 'new-password', style: { WebkitTextFillColor: 'white' } } } }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={<Checkbox {...register('acceptTerms')} sx={{ color: 'rgba(255,255,255,0.85)' }} />}
                label={
                  <span>
                    Acepto los{' '}
                    <MuiLink component={Link} href="/terms" underline="hover" sx={{ color: 'primary.light' }}>
                      Términos
                    </MuiLink>{' '}
                    y la{' '}
                    <MuiLink component={Link} href="/privacy" underline="hover" sx={{ color: 'primary.light' }}>
                      Política de Privacidad
                    </MuiLink>
                  </span>
                }
                sx={{ color: 'rgba(255,255,255,0.9)' }}
              />
              {errors.acceptTerms && <Alert severity="warning" sx={{ mt: 1 }}>{errors.acceptTerms.message}</Alert>}
            </Grid>

            <Grid size={{ xs: 12 }}>
              <SubmitButton type="submit" fullWidth variant="contained" loading={isSubmitting || isLoading}>
                Crear cuenta
              </SubmitButton>
            </Grid>
          </Grid>
        </form>
      </AuthShell>
    </LightLayout>
  );
}