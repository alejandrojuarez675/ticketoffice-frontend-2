// src/app/contact/page.tsx
'use client';

import React, { useState } from 'react';
import LightLayout from '@/components/layouts/LightLayout';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  Divider,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SendIcon from '@mui/icons-material/Send';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar envío de formulario al backend
    console.log('Form data:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 5000);
  };

  return (
    <LightLayout title="Contacto - TuEntradaYa">
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Contáctanos
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 6 }}>
          ¿Tienes alguna pregunta o necesitas ayuda? Estamos aquí para ti.
        </Typography>

        <Grid container spacing={4}>
          {/* Formulario de contacto */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper elevation={2} sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Envíanos un mensaje
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {submitted && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  ¡Gracias por contactarnos! Responderemos a tu mensaje lo antes posible.
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Nombre completo"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Correo electrónico"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Asunto"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Mensaje"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  multiline
                  rows={6}
                  margin="normal"
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  endIcon={<SendIcon />}
                  fullWidth
                  sx={{ mt: 3 }}
                >
                  Enviar mensaje
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Información de contacto */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper elevation={2} sx={{ p: { xs: 3, md: 4 }, height: '100%' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Información de contacto
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ '& > *': { mb: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <EmailIcon sx={{ mr: 2, mt: 0.5, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Correo electrónico
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      soporte@tuentradaya.com
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ventas@tuentradaya.com
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <PhoneIcon sx={{ mr: 2, mt: 0.5, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Teléfono
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Colombia: +57 (1) 234-5678
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Argentina: +54 (11) 1234-5678
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <LocationOnIcon sx={{ mr: 2, mt: 0.5, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Oficinas
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      <strong>Colombia:</strong><br />
                      Calle 123 #45-67<br />
                      Bogotá, Colombia
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Argentina:</strong><br />
                      Av. Corrientes 1234<br />
                      Buenos Aires, Argentina
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Horario de atención
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lunes a Viernes: 9:00 AM - 6:00 PM
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sábados: 10:00 AM - 2:00 PM
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Domingos y festivos: Cerrado
                </Typography>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  * Tiempo de respuesta promedio: 24-48 horas
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Preguntas frecuentes */}
        <Paper elevation={2} sx={{ p: { xs: 3, md: 4 }, mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Preguntas Frecuentes
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                ¿Cómo compro una entrada?
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Busca el evento que te interesa, selecciona la cantidad de entradas y completa el proceso de compra. Recibirás tus entradas por correo electrónico.
              </Typography>
            </Grid>
            <Grid  size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                ¿Puedo devolver una entrada?
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Las devoluciones solo están disponibles si el evento es cancelado por el organizador. Consulta nuestros términos y condiciones para más información.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                ¿Cómo puedo vender entradas para mi evento?
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Regístrate como vendedor en nuestra plataforma y podrás crear y gestionar tus eventos fácilmente.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                ¿Es seguro comprar en TuEntradaYa?
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Sí, utilizamos encriptación SSL y proveedores de pago certificados para garantizar la seguridad de tus transacciones.
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </LightLayout>
  );
}

