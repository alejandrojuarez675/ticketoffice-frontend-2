import React from 'react';
import { Box, Container, Typography, Grid, Link } from '@mui/material';
import { styled } from '@mui/material/styles';

const FooterWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: '#1e1e1e',
  color: theme.palette.text.primary,
  padding: theme.spacing(4, 0),
  marginTop: 'auto',
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: 'white',
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const Footer = () => {
  return (
    <FooterWrapper>
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
              TicketOffice
            </Typography>
            <Typography variant="body2" sx={{ color: 'white' }}>
              Tu plataforma de venta de entradas en línea
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
              Enlaces Rápidos
            </Typography>
            <Typography variant="body2" sx={{ color: 'white' }}>
              <FooterLink href="/">Inicio</FooterLink>
            </Typography>
            <Typography variant="body2" sx={{ color: 'white' }}>
              <FooterLink href="/contact">Contacto</FooterLink>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
              Síguenos
            </Typography>
            <Typography variant="body2" sx={{ color: 'white' }}>
              <FooterLink href="#">Facebook</FooterLink>
            </Typography>
            <Typography variant="body2" sx={{ color: 'white' }}>
              <FooterLink href="#">Instagram</FooterLink>
            </Typography>
            <Typography variant="body2" sx={{ color: 'white' }}>
              <FooterLink href="#">Twitter</FooterLink>
            </Typography>
          </Grid>
        </Grid>
        <Box sx={{ mt: 4, borderTop: 1, borderColor: 'white' }}>
          <Typography variant="body2" align="center" sx={{ py: 2, color: 'white' }}>
            © {new Date().getFullYear()} TicketOffice. Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>
    </FooterWrapper>
  );
};

export default Footer;
