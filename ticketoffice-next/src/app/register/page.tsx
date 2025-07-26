'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link as MuiLink,
  Grid,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import Link from 'next/link';
import { AuthService } from '@/services/AuthService';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);
      await AuthService.register({
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        acceptTerms: formData.acceptTerms,
      });
      
      setSuccess('¡Registro exitoso! Serás redirigido al inicio de sesión...');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Error al registrar el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Grid container spacing={2} justifyContent="center">
        <Grid size={{ xs: 12, sm: 10, md: 8, lg: 6, xl: 5 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: { xs: 2, sm: 4 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography component="h1" variant="h5" gutterBottom>
              Crear una cuenta
            </Typography>
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  width: '100%',
                  mb: 3,
                }}
              >
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert 
                severity="success" 
                sx={{ 
                  width: '100%',
                  mb: 3,
                }}
              >
                {success}
              </Alert>
            )}
            
            <Box 
              component="form" 
              onSubmit={handleSubmit} 
              sx={{ 
                mt: 1,
                width: '100%',
              }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    id="username"
                    name="username"
                    label="Nombre de usuario"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={loading}
                    autoFocus
                    margin="normal"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} component="div">
                  <TextField
                    fullWidth
                    id="firstName"
                    name="firstName"
                    label="Nombre"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={loading}
                    margin="normal"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} component="div">
                  <TextField
                    fullWidth
                    id="lastName"
                    name="lastName"
                    label="Apellido"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={loading}
                    margin="normal"
                  />
                </Grid>
                <Grid size={{ xs: 12 }} component="div">
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    margin="normal"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} component="div">
                  <TextField
                    fullWidth
                    id="password"
                    name="password"
                    label="Contraseña"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    margin="normal"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} component="div">
                  <TextField
                    fullWidth
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirmar Contraseña"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    margin="normal"
                  />
                </Grid>
                <Grid size={{ xs: 12 }} component="div">
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Registrarse'
                    )}
                  </Button>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        Acepto los{' '}
                        <Link href="/terms" color="primary">
                          Términos y Condiciones
                        </Link>{' '}
                        y la{' '}
                        <Link href="/privacy" color="primary">
                          Política de Privacidad
                        </Link>
                      </Typography>
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      ¿Ya tienes una cuenta?{' '}
                      <MuiLink 
                        component={Link} 
                        href="/auth/login" 
                        sx={{ 
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline',
                          }
                        }}
                      >
                        Inicia sesión aquí
                      </MuiLink>
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
