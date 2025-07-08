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
import { myTheme } from '../../theme/my-theme';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import FeaturedEvents from '../../components/FeaturedEvents';

const Hero = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(45deg, ${myTheme.palette.primary.main} 30%, ${myTheme.palette.primary.dark} 90%)`,
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  backgroundBlendMode: 'overlay',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}));

const Features = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  background: myTheme.palette.background.default,
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
  backgroundColor: myTheme.palette.background.paper,
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
              <Typography variant="h1" gutterBottom sx={{ fontSize: { xs: '2rem', md: '3rem' }, color: 'white' }}>
                Sistema de Gestión de Eventos
              </Typography>
              <Typography variant="h5" paragraph sx={{ mb: 4, color: 'white' }}>
                La solución completa para la gestión de eventos y venta de boletos en línea
              </Typography>
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: myTheme.palette.primary.main,
                  color: myTheme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: myTheme.palette.primary.dark,
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

      <Features sx={{ backgroundColor: myTheme.palette.background.default }}>
        <Container maxWidth="lg">
          <Typography variant="h2" gutterBottom align="center" sx={{ color: 'white' }}>
            Características Principales
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <FeatureCard sx={{ backgroundColor: myTheme.palette.background.paper }}>
                  <CardContent>
                    <Typography component="h2" variant="h4" gutterBottom sx={{ color: 'white' }}>
                      {feature.icon}
                    </Typography>
                    <Typography variant="h5" gutterBottom sx={{ color: 'white' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ color: 'white' }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Features>
      <FeaturedEvents />
    </Box>
  );
};

export default Landing;
