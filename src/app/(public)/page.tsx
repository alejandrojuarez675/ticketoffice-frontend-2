'use client';

import React, { useState, useEffect } from 'react';
import LightLayout from '@/components/layouts/LightLayout';
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
  IconButton,
} from '@mui/material';
import Link from 'next/link';
import FeaturedEvents from '@/components/events/FeaturedEvents';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const Hero = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: theme.palette.grey[900],
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
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

function HomeContent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Carrusel de imágenes de fondo
  const backgroundImages = [
    '/home1.jpeg',
    '/home2.jpeg',
    '/home3.jpeg',
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-avanzar cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + backgroundImages.length) % backgroundImages.length);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
  };

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
        {/* Carrusel de imágenes de fondo */}
        {backgroundImages.map((img, index) => (
          <Box
            key={img}
            component="img"
            src={img}
            alt={`Imagen de fondo ${index + 1}`}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: currentImageIndex === index ? 0.3 : 0,
              transition: 'opacity 1s ease-in-out',
              zIndex: 0,
            }}
          />
        ))}

        {/* Controles de navegación */}
        <IconButton
          onClick={handlePrevImage}
          aria-label="Imagen anterior"
          sx={{
            position: 'absolute',
            left: { xs: 8, sm: 16, md: 24 },
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            backdropFilter: 'blur(4px)',
            width: { xs: 40, md: 48 },
            height: { xs: 40, md: 48 },
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
            },
          }}
        >
          <ArrowBackIosNewIcon sx={{ fontSize: { xs: 18, md: 24 } }} />
        </IconButton>

        <IconButton
          onClick={handleNextImage}
          aria-label="Siguiente imagen"
          sx={{
            position: 'absolute',
            right: { xs: 8, sm: 16, md: 24 },
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            backdropFilter: 'blur(4px)',
            width: { xs: 40, md: 48 },
            height: { xs: 40, md: 48 },
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
            },
          }}
        >
          <ArrowForwardIosIcon sx={{ fontSize: { xs: 18, md: 24 } }} />
        </IconButton>

        {/* Indicadores de puntos */}
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: 16, sm: 24 },
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: { xs: 0.5, sm: 1 },
            zIndex: 2,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(4px)',
            px: { xs: 1.5, sm: 2 },
            py: { xs: 0.75, sm: 1 },
            borderRadius: 3,
          }}
        >
          {backgroundImages.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              role="button"
              tabIndex={0}
              aria-label={`Ver imagen ${index + 1}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setCurrentImageIndex(index);
                }
              }}
              sx={{
                width: { xs: 10, sm: 12 },
                height: { xs: 10, sm: 12 },
                borderRadius: '50%',
                backgroundColor: currentImageIndex === index ? 'white' : 'rgba(255, 255, 255, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  transform: 'scale(1.2)',
                },
              }}
            />
          ))}
        </Box>

        {/* Contenido principal */}
        <Container 
          maxWidth="lg" 
          sx={{ 
            position: 'relative', 
            zIndex: 1,
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h1" 
              gutterBottom 
              sx={{ 
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                fontWeight: 700,
                lineHeight: 1.2,
                mb: { xs: 2, md: 3 },
                textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)',
              }}
            >
              Sistema de Gestión de Eventos
            </Typography>
            <Typography 
              variant="h5" 
              paragraph 
              sx={{ 
                mb: { xs: 3, md: 4 },
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                textShadow: '1px 1px 4px rgba(0, 0, 0, 0.5)',
              }}
            >
              La solución completa para la gestión de eventos y venta de boletos en línea
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                gap: 2, 
                justifyContent: 'center',
                px: { xs: 1, sm: 0 },
              }}
            >
              <Button
                component={Link}
                href="/events?country=all"
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: 'background.paper',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'grey.100',
                    transform: 'scale(1.05)',
                  },
                  py: { xs: 1.25, md: 1.5 },
                  px: { xs: 3, md: 4 },
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  boxShadow: 4,
                }}
              >
                Ver todos los eventos
              </Button>
              <Button
                component={Link}
                href="/auth/register"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'white',
                  borderWidth: 2,
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(4px)',
                  fontWeight: 600,
                  textShadow: '2px 2px 8px rgba(0, 0, 0, 0.7)',
                  '&:hover': {
                    borderColor: 'white',
                    borderWidth: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1.05)',
                    textShadow: '2px 2px 10px rgba(0, 0, 0, 0.8)',
                  },
                  py: { xs: 1.25, md: 1.5 },
                  px: { xs: 3, md: 4 },
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                }}
              >
                Quiero ser vendedor
              </Button>
            </Box>
          </Box>
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

export default function Home() {
  return (
    <LightLayout title="Inicio - TuEntradaYa">
      <HomeContent />
    </LightLayout>
  );
}
