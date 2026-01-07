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
  CircularProgress,
  Link as MuiLink,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SendIcon from '@mui/icons-material/Send';
import { sanitizeString, sanitizeEmail } from '@/utils/sanitize';
import { ContactService } from '@/services/ContactService';
import { FAQJsonLd } from '@/components/seo';

// Preguntas frecuentes para SEO
const FAQ_ITEMS = [
  {
    question: '¿Cómo compro una entrada?',
    answer: 'Busca el evento que te interesa, selecciona la cantidad de entradas y completa el proceso de compra. Recibirás tus entradas por correo electrónico.',
  },
  {
    question: '¿Puedo devolver una entrada?',
    answer: 'Las devoluciones solo están disponibles si el evento es cancelado por el organizador. Consulta nuestros términos y condiciones para más información.',
  },
  {
    question: '¿Cómo puedo vender entradas para mi evento?',
    answer: 'Regístrate como vendedor en nuestra plataforma y podrás crear y gestionar tus eventos fácilmente.',
  },
  {
    question: '¿Es seguro comprar en TuEntradaYa?',
    answer: 'Sí, utilizamos encriptación SSL y proveedores de pago certificados para garantizar la seguridad de tus transacciones.',
  },
];

// Números de WhatsApp (solo dígitos para el link)
const WHATSAPP_COLOMBIA = '573145429669';
const WHATSAPP_ARGENTINA = '5493436210450';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Sanitizar todos los inputs antes de procesar
    const sanitizedData = {
      name: sanitizeString(formData.name),
      email: sanitizeEmail(formData.email),
      subject: sanitizeString(formData.subject),
      message: sanitizeString(formData.message),
    };
    
    // Validar email
    if (!sanitizedData.email) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }
    
    // Validar campos requeridos
    if (!sanitizedData.name || !sanitizedData.subject || !sanitizedData.message) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await ContactService.submitContactForm(sanitizedData);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Error enviando formulario:', err);
      setError('Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LightLayout title="Contacto - TuEntradaYa">
      {/* SEO: FAQ Schema.org JSON-LD */}
      <FAQJsonLd items={FAQ_ITEMS} />
      
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

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
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
                  endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  fullWidth
                  disabled={isSubmitting}
                  sx={{ mt: 3 }}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
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
                  <WhatsAppIcon sx={{ mr: 2, mt: 0.5, color: '#25D366' }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      WhatsApp
                    </Typography>
                    <MuiLink
                      href={`https://wa.me/${WHATSAPP_COLOMBIA}?text=Hola,%20tengo%20una%20consulta`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ 
                        display: 'block', 
                        color: 'text.secondary',
                        textDecoration: 'none',
                        '&:hover': { color: '#25D366', textDecoration: 'underline' }
                      }}
                    >
                      🇨🇴 Colombia: +57 314 542 9669
                    </MuiLink>
                    <MuiLink
                      href={`https://wa.me/${WHATSAPP_ARGENTINA}?text=Hola,%20tengo%20una%20consulta`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ 
                        display: 'block', 
                        color: 'text.secondary',
                        textDecoration: 'none',
                        '&:hover': { color: '#25D366', textDecoration: 'underline' }
                      }}
                    >
                      🇦🇷 Argentina: +54 9 3436 21-0450
                    </MuiLink>
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

