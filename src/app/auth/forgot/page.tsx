'use client';

import React, { useState } from 'react';
import LightLayout from '@/components/layouts/LightLayout';
import AuthShell from '@/components/auth/AuthShell';
import SubmitButton from '@/components/forms/SubmitButton';
import { TextField, Alert, Link as MuiLink, Typography } from '@mui/material';
import Link from 'next/link';
import { useSnackbar } from '@/components/forms/SnackbarProvider';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthService } from '@/services/AuthService';

const Schema = z.object({
  email: z.string().email('Email inválido'),
});
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

export default function ForgotPage() {
  const { showSnack } = useSnackbar();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Data>({ resolver: zodResolver(Schema), defaultValues: { email: '' } });

  const onSubmit = async (data: Data) => {
    try {
      await AuthService.requestPasswordReset(data.email);
      setSent(true);
      showSnack({ message: 'Si el correo existe, te enviamos un enlace para restablecer la contraseña.', severity: 'success' });
    } catch (err) {
      showSnack({ message: 'No se pudo procesar la solicitud. Intenta de nuevo.', severity: 'error' });
    }
  };

  return (
    <LightLayout title="Recuperar contraseña - TicketOffice">
      <AuthShell
        title="Recuperar contraseña"
        textColor="common.white"
        footer={
          <MuiLink component={Link} href="/auth/login" underline="hover" sx={{ color: 'primary.light' }}>
            Volver a iniciar sesión
          </MuiLink>
        }
      >
        {sent ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Si el correo proporcionado corresponde a una cuenta, recibirás un enlace para restablecer tu contraseña.
          </Alert>
        ) : (
          <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.85)' }}>
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
          </Typography>
        )}

        {!sent && (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              fullWidth
              label="Email"
              type="email"
              autoComplete="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message ?? ' '}
              disabled={isSubmitting}
              sx={inputSx}
            />
            <SubmitButton type="submit" fullWidth variant="contained" loading={isSubmitting}>
              Enviar enlace
            </SubmitButton>
          </form>
        )}
      </AuthShell>
    </LightLayout>
  );
}