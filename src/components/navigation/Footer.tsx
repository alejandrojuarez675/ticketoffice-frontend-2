// src/components/navigation/Footer.tsx
import { Box, Container, Typography, Link as MuiLink, Divider } from '@mui/material';
import Link from 'next/link';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => (theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[900]),
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body1" color="text.secondary">
            © {new Date().getFullYear()} TuEntradaYa. Todos los derechos reservados.
          </Typography>

          <Box sx={{ display: 'flex', gap: 3, mt: { xs: 2, md: 0 } }}>
            <MuiLink component={Link} href="/terms" color="text.secondary" underline="hover" variant="body2">
              Términos y Condiciones
            </MuiLink>
            <MuiLink component={Link} href="/privacy" color="text.secondary" underline="hover" variant="body2">
              Política de Privacidad
            </MuiLink>
            <MuiLink component={Link} href="/contact" color="text.secondary" underline="hover" variant="body2">
              Contacto
            </MuiLink>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary" align="center">
          Desarrollado con ❤️ por TuEntradaYa
        </Typography>
      </Container>
    </Box>
  );
}