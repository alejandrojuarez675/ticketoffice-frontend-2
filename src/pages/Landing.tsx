import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const Hero = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
}));

const Features = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  background: 'white',
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const Landing: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const features = [
    {
      title: 'Gestión de Eventos',
      description: 'Organiza y gestiona todos tus eventos de manera eficiente',
      icon: '📅',
    },
    {
      title: 'Venta de Boletos',
      description: 'Sistema de venta de boletos en línea',
      icon: '🎟️',
    },
    {
      title: 'Reportes en Tiempo Real',
      description: 'Accede a estadísticas y reportes detallados',
      icon: '📊',
    },
  ];

  return (
    <Box>
      <Hero>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h1" gutterBottom sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
                Sistema de Gestión de Eventos
              </Typography>
              <Typography variant="h5" paragraph sx={{ mb: 4 }}>
                La solución completa para la gestión de eventos y venta de boletos en línea
              </Typography>
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  },
                }}
              >
                Iniciar Sesión
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <CardMedia
                component="img"
                image="/images/landing-hero.png"
                alt="Sistema de Eventos"
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxWidth: 500,
                  display: isMobile ? 'none' : 'block',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Hero>

      <Features>
        <Container maxWidth="lg">
          <Typography variant="h2" gutterBottom align="center">
            Características Principales
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <FeatureCard>
                  <CardContent>
                    <Typography component="h2" variant="h4" gutterBottom>
                      {feature.icon}
                    </Typography>
                    <Typography variant="h5" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Features>
    </Box>
  );
};

export default Landing;
