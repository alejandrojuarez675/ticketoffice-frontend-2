// src/app/terms/page.tsx
'use client';

import React from 'react';
import LightLayout from '@/components/layouts/LightLayout';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';

export default function TermsPage() {
  return (
    <LightLayout title="Términos y Condiciones - TuEntradaYa">
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper elevation={2} sx={{ p: { xs: 3, md: 5 } }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Términos y Condiciones
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>

          <Divider sx={{ mb: 4 }} />

          <Box sx={{ '& > *': { mb: 3 } }}>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                1. Aceptación de los Términos
              </Typography>
              <Typography variant="body1" paragraph>
                Al acceder y utilizar TuEntradaYa, usted acepta estar sujeto a estos Términos y Condiciones, todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de todas las leyes locales aplicables.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                2. Uso de la Plataforma
              </Typography>
              <Typography variant="body1" paragraph>
                TuEntradaYa es una plataforma de venta y distribución de entradas para eventos. Los usuarios pueden:
              </Typography>
              <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                <li>Buscar y comprar entradas para eventos</li>
                <li>Crear y gestionar eventos (vendedores autorizados)</li>
                <li>Validar entradas en el punto de acceso</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                3. Registro y Cuenta de Usuario
              </Typography>
              <Typography variant="body1" paragraph>
                Para utilizar ciertas funciones de la plataforma, debe registrarse y crear una cuenta. Usted es responsable de:
              </Typography>
              <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                <li>Mantener la confidencialidad de su contraseña</li>
                <li>Todas las actividades que ocurran bajo su cuenta</li>
                <li>Notificarnos inmediatamente sobre cualquier uso no autorizado</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                4. Compra de Entradas
              </Typography>
              <Typography variant="body1" paragraph>
                Al comprar entradas a través de TuEntradaYa:
              </Typography>
              <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                <li>Todas las ventas son finales, salvo cancelación del evento</li>
                <li>Las entradas son válidas únicamente para el evento especificado</li>
                <li>No se permite la reventa de entradas sin autorización</li>
                <li>Recibirá su entrada digital por correo electrónico</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                5. Responsabilidades del Organizador
              </Typography>
              <Typography variant="body1" paragraph>
                Los organizadores de eventos son responsables de:
              </Typography>
              <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                <li>La veracidad de la información del evento</li>
                <li>La realización del evento en fecha y hora indicadas</li>
                <li>El cumplimiento de todas las regulaciones locales</li>
                <li>La devolución de fondos en caso de cancelación</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                6. Pagos y Reembolsos
              </Typography>
              <Typography variant="body1" paragraph>
                Los pagos se procesan a través de proveedores de pago seguros. Los reembolsos solo se otorgan en caso de:
              </Typography>
              <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                <li>Cancelación del evento por parte del organizador</li>
                <li>Error en el procesamiento de la compra</li>
                <li>Duplicación de cargos</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                7. Propiedad Intelectual
              </Typography>
              <Typography variant="body1" paragraph>
                Todo el contenido de la plataforma, incluyendo textos, gráficos, logos, imágenes y software, es propiedad de TuEntradaYa o sus licenciantes y está protegido por las leyes de propiedad intelectual.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                8. Limitación de Responsabilidad
              </Typography>
              <Typography variant="body1" paragraph>
                TuEntradaYa actúa como intermediario entre compradores y organizadores. No somos responsables de:
              </Typography>
              <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                <li>La calidad o realización de los eventos</li>
                <li>Daños o pérdidas sufridas en los eventos</li>
                <li>Cambios de última hora realizados por los organizadores</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                9. Modificaciones
              </Typography>
              <Typography variant="body1" paragraph>
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en la plataforma.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                10. Contacto
              </Typography>
              <Typography variant="body1" paragraph>
                Para cualquier pregunta sobre estos Términos y Condiciones, puede contactarnos a través de nuestra página de contacto o enviando un correo electrónico a: legal@tuentradaya.com
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </LightLayout>
  );
}

