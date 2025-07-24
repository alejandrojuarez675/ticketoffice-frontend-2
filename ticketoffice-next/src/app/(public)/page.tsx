'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  useTheme,
  useMediaQuery,
  styled,
} from '@mui/material';
import Link from 'next/link';
import FeaturedEvents from '@/components/events/FeaturedEvents';

const Hero = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
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
  padding: theme.spacing(8, 4),
  backgroundColor: theme.palette.background.default,
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  padding: theme.spacing(4),
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
  backgroundColor: theme.palette.background.paper,
}));

export default function Home() {
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
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography 
                variant="h1" 
                gutterBottom 
                sx={{ 
                  fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                  fontWeight: 700,
                  lineHeight: 1.2,
                  mb: 3,
                }}
              >
                Sistema de Gestión de Eventos
              </Typography>
              <Typography 
                variant="h5" 
                paragraph 
                sx={{ 
                  mb: 4,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                }}
              >
                La solución completa para la gestión de eventos y venta de boletos en línea
              </Typography>
              <Button
                component={Link}
                href="/register"
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: 'background.paper',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                }}
              >
                Quiero ser vendedor
              </Button>
            </Grid>
            {!isMobile && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  component="img"
                  src="/images/landing-hero.png"
                  alt="Sistema de Eventos"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    maxWidth: 600,
                    display: { xs: 'none', md: 'block' },
                    borderRadius: 2,
                    boxShadow: 6,
                  }}
                />
              </Grid>
            )}
          </Grid>
        </Container>
      </Hero>

      <Features>
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            gutterBottom 
            align="center" 
            sx={{ 
              mb: 6,
              fontWeight: 600,
            }}
          >
            Características Principales
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, sm: 4 }} key={index}>
                <FeatureCard>
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      fontSize: '3rem',
                      mb: 2,
                      lineHeight: 1,
                    }}
                  >
                    {feature.icon}
                  </Typography>
                  <Typography 
                    variant="h5" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 600,
                      mb: 2,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body1">
                    {feature.description}
                  </Typography>
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Features>

      <FeaturedEvents />
    </Box>
  );
}
