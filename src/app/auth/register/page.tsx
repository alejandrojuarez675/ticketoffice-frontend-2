// src/app/auth/register/page.tsx
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
import { sanitizeUsername, sanitizeEmail, sanitizeString } from '@/utils/sanitize';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Collapse from '@mui/material/Collapse';

// Usuario: debe iniciar con letra; permite números, punto y guion bajo
const usernameRegex = /^[A-Za-z][A-Za-z0-9._]{2,19}$/;
// Repeticiones prohibidas de símbolos
const forbidRepeats = /(\\.\\.|__|_\\.)/;
// Nombre/Apellido: permite letras acentuadas, espacios, apóstrofo, guion y (ahora) dígitos
// Si quieres volver a “solo letras”, elimina 0-9 del conjunto.
const nameRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' 0-9-]{2,50}$/;
const RegisterSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'El usuario debe tener al menos 3 caracteres')
      .max(20, 'Máximo 20 caracteres')
      .regex(usernameRegex, 'Solo letras, números, punto y guion bajo; debe iniciar con letra')
      .refine((s) => !forbidRepeats.test(s), 'Evita repeticiones de símbolos (.., __, _.)'),
    firstName: z
      .string()
      .trim()
      .min(2, 'Nombre demasiado corto')
      .max(50, 'Nombre demasiado largo')
      .regex(nameRegex, 'Nombre inválido (usa letras, espacios, guion y números si es necesario)'),
    lastName: z
      .string()
      .trim()
      .min(2, 'Apellido demasiado corto')
      .max(50, 'Apellido demasiado largo')
      .regex(nameRegex, 'Apellido inválido (usa letras, espacios, guion y números si es necesario)'),
    email: z.string().trim().email('Email inválido'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[a-z]/, 'Debe incluir minúsculas')
      .regex(/[A-Z]/, 'Debe incluir mayúsculas')
      .regex(/[0-9]/, 'Debe incluir números'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, { message: 'Debes aceptar los términos y condiciones' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type RegisterData = z.infer<typeof RegisterSchema>;

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

  // Si el usuario ya está autenticado al cargar la página, redirigir al perfil
  // Pero NO redirigir si acabamos de registrarnos (el onSubmit maneja esa redirección)
  const [hasJustRegistered, setHasJustRegistered] = useState(false);
  
  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasJustRegistered) {
      router.replace('/admin/profile');
    }
  }, [isAuthenticated, isLoading, router, hasJustRegistered]);

  const passwordValue = useWatch({ control, name: 'password', defaultValue: '' });
  const strength = useMemo(() => getPasswordStrength(passwordValue), [passwordValue]);

  // Disponibilidad (MVP: desactivada mientras no exista endpoint real)
  const [userAvail] = useState<'idle' | 'loading' | 'ok' | 'taken'>('idle');
  const [mailAvail] = useState<'idle' | 'loading' | 'ok' | 'taken'>('idle');

  const [pwdFocused, setPwdFocused] = useState(false);
  const showPwdHints = pwdFocused || passwordValue.length > 0;

  const rules = [
    { ok: passwordValue.length >= 8, label: 'Mínimo 8 caracteres' },
    { ok: hasLower(passwordValue), label: 'Al menos una minúscula' },
    { ok: hasUpper(passwordValue), label: 'Al menos una mayúscula' },
    { ok: hasNumber(passwordValue), label: 'Al menos un número' },
  ];

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <LightLayout title="Cargando...">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </LightLayout>
    );
  }

  // Si ya está autenticado y no acabamos de registrarnos, no mostrar nada (se está redirigiendo)
  if (isAuthenticated && !hasJustRegistered) {
    return null;
  }

  const onSubmit = async (data: RegisterData) => {
    try {
      // Validate password requirements before submission
      if (!meetsBasicPasswordRules(data.password)) {
        showSnack({ 
          message: 'La contraseña debe incluir mayúsculas, minúsculas y al menos un número', 
          severity: 'error' 
        });
        return;
      }
      
      // Sanitizar datos antes de enviarlos al backend
      const sanitizedUsername = sanitizeUsername(data.username);
      const sanitizedEmail = sanitizeEmail(data.email);
      
      if (!sanitizedUsername || !sanitizedEmail) {
        showSnack({ 
          message: 'Por favor, verifica que el usuario y email sean válidos', 
          severity: 'error' 
        });
        return;
      }
      
      // Only send required fields to the backend
      const response = await AuthService.register({
        username: sanitizedUsername,
        password: data.password, // No sanitizar contraseña
        email: sanitizedEmail,
        remember: true,
      });
      
      if (response?.token) {
        // Marcar que acabamos de registrarnos para evitar la redirección del useEffect
        setHasJustRegistered(true);
        
        showSnack({ 
          message: '¡Cuenta creada con éxito! Redirigiendo a tu perfil...', 
          severity: 'success' 
        });
        
        // Pequeña espera para mostrar el mensaje y luego redirigir
        setTimeout(() => {
          router.push('/admin/profile');
        }, 800);
      }
    } catch (err: unknown) {
      let errorMessage = 'Error al crear la cuenta';
      
      // Type guard to check if error has response property
      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as {
          response?: {
            data?: {
              code?: string;
              message?: string | { includes: (str: string) => boolean };
            };
          };
        };
        
        if (errorResponse.response?.data?.code === 'BAD_REQUEST' && 
            typeof errorResponse.response.data.message === 'string' && 
            errorResponse.response.data.message.includes('already exists')) {
          errorMessage = 'El nombre de usuario o correo electrónico ya está en uso';
        } else if (errorResponse.response?.data?.message) {
          errorMessage = String(errorResponse.response.data.message);
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      showSnack({ 
        message: errorMessage, 
        severity: 'error',
        duration: 5000
      });
    }
  };

  return (
    <LightLayout title="Registro - TuEntradaYa">
      <AuthShell
        title="Crear cuenta"
        footer={
          <MuiLink component={Link} href="/auth/login" underline="hover">
            ¿Ya tienes cuenta? Inicia sesión
          </MuiLink>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
          {errors.root && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.root.message}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Usuario"
                autoComplete="off"
                {...register('username')}
                error={!!errors.username || userAvail === 'taken'}
                helperText={errors.username?.message ?? ' '}
                disabled={isSubmitting || isLoading}
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
                helperText={errors.email?.message ?? ' '}
                disabled={isSubmitting || isLoading}
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
                        // Trigger validation on blur
                        if (field.value) {
                          field.onChange(field.value);
                        }
                      }}
                      error={!!fieldState.error || (field.value ? !meetsBasicPasswordRules(field.value) : false)}
                      helperText={
                        showPwdHints 
                          ? fieldState.error?.message ?? 
                            (field.value && !meetsBasicPasswordRules(field.value) 
                              ? 'La contraseña debe incluir mayúsculas, minúsculas y al menos un número'
                              : 'Mínimo 8 caracteres, incluir mayúsculas, minúsculas y números.')
                          : ' '
                      }
                      disabled={isSubmitting || isLoading}
                    />
                    {showPwdHints && (
                      <Collapse in={showPwdHints} timeout={200} unmountOnExit>
                        <PasswordStrengthBar strength={strength} />
                        <Box sx={{ mt: 1 }}>
                          {rules.map((r) => (
                            <Typography key={r.label} variant="caption" sx={{ display: 'block', color: r.ok ? 'success.main' : 'text.secondary' }}>
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
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={<Checkbox {...register('acceptTerms')} />}
                label={
                  <span>
                    Acepto los{' '}
                    <MuiLink component={Link} href="/terms" underline="hover">
                      Términos
                    </MuiLink>{' '}
                    y la{' '}
                    <MuiLink component={Link} href="/privacy" underline="hover">
                      Política de Privacidad
                    </MuiLink>
                  </span>
                }
              />
              {errors.acceptTerms && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  {errors.acceptTerms.message}
                </Alert>
              )}
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
