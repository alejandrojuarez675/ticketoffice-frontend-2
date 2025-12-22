// src/app/privacy/page.tsx
'use client';

import React from 'react';
import LightLayout from '@/components/layouts/LightLayout';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';

export default function PrivacyPage() {
  return (
    <LightLayout title="Política de Privacidad - TuEntradaYa">
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper elevation={2} sx={{ p: { xs: 3, md: 5 } }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Política de Privacidad
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>

          <Divider sx={{ mb: 4 }} />

          <Box sx={{ '& > *': { mb: 3 } }}>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                1. Introducción
              </Typography>
              <Typography variant="body1" paragraph>
                En TuEntradaYa, nos comprometemos a proteger su privacidad y garantizar la seguridad de su información personal. Esta Política de Privacidad explica cómo recopilamos, usamos, compartimos y protegemos su información.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                2. Información que Recopilamos
              </Typography>
              <Typography variant="body1" paragraph>
                Recopilamos la siguiente información:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 2 }}>
                Información de Registro:
              </Typography>
              <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                <li>Nombre completo</li>
                <li>Dirección de correo electrónico</li>
                <li>Número de teléfono</li>
                <li>Documento de identidad (para verificación)</li>
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 2 }}>
                Información de Compra:
              </Typography>
              <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                <li>Historial de compras</li>
                <li>Información de pago (procesada por terceros seguros)</li>
                <li>Preferencias de eventos</li>
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 2 }}>
                Información Técnica:
              </Typography>
              <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                <li>Dirección IP</li>
                <li>Tipo de navegador</li>
                <li>Dispositivo utilizado</li>
                <li>Cookies y tecnologías similares</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                3. Cómo Usamos su Información
              </Typography>
              <Typography variant="body1" paragraph>
                Utilizamos su información para:
              </Typography>
              <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                <li>Procesar sus compras y enviar entradas digitales</li>
                <li>Gestionar su cuenta y proporcionar soporte al cliente</li>
                <li>Enviar notificaciones sobre sus compras y eventos</li>
                <li>Mejorar nuestros servicios y experiencia de usuario</li>
                <li>Prevenir fraudes y garantizar la seguridad</li>
                <li>Cumplir con obligaciones legales</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                4. Compartir Información
              </Typography>
              <Typography variant="body1" paragraph>
                Podemos compartir su información con:
              </Typography>
              <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                <li><strong>Organizadores de Eventos:</strong> Para gestionar el acceso a los eventos</li>
                <li><strong>Proveedores de Pago:</strong> Para procesar transacciones de forma segura</li>
                <li><strong>Proveedores de Servicios:</strong> Que nos ayudan a operar la plataforma</li>
                <li><strong>Autoridades:</strong> Cuando sea requerido por ley</li>
              </Typography>
              <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                Nunca vendemos su información personal a terceros.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                5. Seguridad de los Datos
              </Typography>
              <Typography variant="body1" paragraph>
                Implementamos medidas de seguridad técnicas y organizativas para proteger su información:
              </Typography>
              <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                <li>Encriptación SSL/TLS para todas las transmisiones</li>
                <li>Almacenamiento seguro de datos</li>
                <li>Acceso restringido a información personal</li>
                <li>Monitoreo continuo de seguridad</li>
                <li>Auditorías regulares de seguridad</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                6. Sus Derechos
              </Typography>
              <Typography variant="body1" paragraph>
                Usted tiene derecho a:
              </Typography>
              <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                <li><strong>Acceder:</strong> Solicitar una copia de su información personal</li>
                <li><strong>Rectificar:</strong> Corregir información inexacta o incompleta</li>
                <li><strong>Eliminar:</strong> Solicitar la eliminación de su información</li>
                <li><strong>Portabilidad:</strong> Recibir su información en formato estructurado</li>
                <li><strong>Oposición:</strong> Oponerse al procesamiento de su información</li>
                <li><strong>Revocar Consentimiento:</strong> En cualquier momento</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                7. Cookies
              </Typography>
              <Typography variant="body1" paragraph>
                Utilizamos cookies para:
              </Typography>
              <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                <li>Mantener su sesión activa</li>
                <li>Recordar sus preferencias</li>
                <li>Analizar el uso de la plataforma</li>
                <li>Personalizar su experiencia</li>
              </Typography>
              <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                Puede configurar su navegador para rechazar cookies, aunque esto puede afectar la funcionalidad de la plataforma.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                8. Retención de Datos
              </Typography>
              <Typography variant="body1" paragraph>
                Conservamos su información personal solo durante el tiempo necesario para cumplir con los propósitos descritos en esta política, a menos que la ley requiera o permita un período de retención más largo.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                9. Menores de Edad
              </Typography>
              <Typography variant="body1" paragraph>
                Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos intencionalmente información de menores. Si descubrimos que hemos recopilado información de un menor, la eliminaremos de inmediato.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                10. Cambios a esta Política
              </Typography>
              <Typography variant="body1" paragraph>
                Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos sobre cambios significativos publicando la nueva política en nuestra plataforma y actualizando la fecha de &quot;última actualización&quot;.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                11. Contacto
              </Typography>
              <Typography variant="body1" paragraph>
                Para ejercer sus derechos o hacer preguntas sobre esta política, contáctenos en:
              </Typography>
              <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                <li>Email: privacidad@tuentradaya.com</li>
                <li>Formulario de contacto en nuestra plataforma</li>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </LightLayout>
  );
}

