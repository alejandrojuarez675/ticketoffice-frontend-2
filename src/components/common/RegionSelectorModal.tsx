// src/components/common/RegionSelectorModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { RegionService, type CountryDto, type CountryConfigDto } from '@/services/RegionService';
import { logger } from '@/lib/logger';

type RegionSelectorModalProps = {
  open: boolean;
  onSelect: (countryCode: string, config: CountryConfigDto, cityCode?: string) => void;
  defaultCountryCode?: string;
  allowClose?: boolean;
};

export default function RegionSelectorModal({ 
  open, 
  onSelect, 
  defaultCountryCode,
  allowClose = false,
}: RegionSelectorModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [countries, setCountries] = useState<CountryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(defaultCountryCode || null);
  const [countryConfig, setCountryConfig] = useState<CountryConfigDto | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Cargar lista de países
  useEffect(() => {
    let active = true;
    
    const loadCountries = async () => {
      try {
        setLoading(true);
        setError(null);
        logger.info('Loading countries list');
        const countriesList = await RegionService.getCountries();
        
        if (!active) return;
        
        logger.info('Countries loaded', { count: countriesList.length, countries: countriesList });
        setCountries(countriesList);
        
        // Si hay un país por defecto, cargarlo automáticamente (pero no bloquear)
        if (defaultCountryCode) {
          logger.info('Preloading default country config', { defaultCountryCode });
          // Cargar en background, sin await
          loadCountryConfig(defaultCountryCode).catch(err => {
            logger.error('Error preloading country config', err);
          });
        }
      } catch (err) {
        if (active) {
          logger.error('Error loading countries', err);
          setError('No se pudieron cargar los países disponibles');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    
    // Solo cargar si el modal está abierto
    if (open) {
      loadCountries();
    }
    
    return () => {
      active = false;
    };
  }, [open]);

  const loadCountryConfig = async (countryCode: string) => {
    try {
      logger.info('Loading country config', { countryCode });
      const config = await RegionService.getCountryConfig(countryCode);
      logger.info('Country config loaded', { countryCode, config });
      setCountryConfig(config);
      setSelectedCountry(countryCode);
      
      // Pre-seleccionar la primera ciudad si existe
      if (config.cities.length > 0) {
        setSelectedCity(config.cities[0].code);
      }
    } catch (err) {
      logger.error('Error loading country config', { countryCode, err });
      setError('No se pudo cargar la configuración del país');
    }
  };

  const handleCountrySelect = async (countryCode: string) => {
    logger.info('Country selected', { countryCode });
    setSelectedCountry(countryCode);
    setCountryConfig(null);
    setSelectedCity('');
    await loadCountryConfig(countryCode);
  };

  const handleConfirm = async () => {
    if (!selectedCountry || !countryConfig) return;
    
    try {
      setSubmitting(true);
      onSelect(selectedCountry, countryConfig, selectedCity || undefined);
    } catch (err) {
      logger.error('Error confirming region selection', err);
      setError('Error al guardar la configuración');
    } finally {
      setSubmitting(false);
    }
  };

  const getCountryFlag = (countryCode: string): string => {
    const flags: Record<string, string> = {
      ARG: '🇦🇷',
      AR: '🇦🇷',
      COL: '🇨🇴',
      CO: '🇨🇴',
      OTHER: '🌎',
    };
    return flags[countryCode] || '🌍';
  };

  const getCountryDescription = (countryCode: string): string => {
    const descriptions: Record<string, string> = {
      ARG: 'Peso argentino, DNI, zona horaria ART',
      AR: 'Peso argentino, DNI, zona horaria ART',
      COL: 'Peso colombiano, CC, zona horaria COT',
      CO: 'Peso colombiano, CC, zona horaria COT',
      OTHER: 'Dólar USD, Pasaporte, tu zona horaria',
    };
    return descriptions[countryCode] || 'Configuración personalizada';
  };

  return (
    <Dialog 
      open={open} 
      maxWidth="md" 
      fullWidth
      fullScreen={isMobile}
      disableEscapeKeyDown={!allowClose}
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.85)', // Fondo oscuro más sólido
          backdropFilter: 'blur(8px)', // Efecto blur para difuminar el fondo
        },
        '& .MuiDialog-paper': {
          borderRadius: isMobile ? 0 : 2,
          backgroundColor: theme.palette.background.paper, // Fondo sólido
          backgroundImage: 'none', // Remover cualquier gradiente de MUI
          boxShadow: theme.shadows[24], // Sombra más fuerte
        },
      }}
    >
      <DialogContent sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <PublicIcon 
            sx={{ 
              fontSize: { xs: 60, md: 80 }, 
              color: 'primary.main',
              mb: 2,
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.1)' },
              },
            }} 
          />
          <Typography 
            variant="h4" 
            gutterBottom 
            fontWeight="bold"
            sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' } }}
          >
            Bienvenido a TuEntradaYa
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ maxWidth: 500, mx: 'auto', mb: 2 }}
          >
            {!selectedCountry 
              ? 'Selecciona tu país para personalizar precios, horarios y formularios'
              : 'Confirma tu configuración para continuar'
            }
          </Typography>
          {!selectedCountry && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ maxWidth: 500, mx: 'auto', mb: 2, fontStyle: 'italic' }}
            >
              Podrás ver eventos de cualquier país, sin importar tu configuración
            </Typography>
          )}
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && !selectedCountry && (
          <Grid container spacing={2}>
            {countries.map((country) => (
              <Grid size={{ xs: 12, sm: 4 }} key={country.code}>
                <Card 
                  elevation={3}
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[10],
                    },
                  }}
                >
                  <CardActionArea 
                    onClick={() => handleCountrySelect(country.code)}
                    sx={{ height: '100%', py: 3 }}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography 
                        variant="h1" 
                        sx={{ 
                          fontSize: { xs: '3rem', md: '4rem' },
                          mb: 2,
                        }}
                      >
                        {getCountryFlag(country.code)}
                      </Typography>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        {country.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getCountryDescription(country.code)}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {!loading && !error && selectedCountry && countryConfig && (
          <Box>
            {/* País seleccionado */}
            <Card 
              sx={{ 
                mb: 3, 
                p: 2,
                background: alpha(theme.palette.success.main, 0.1),
                border: `2px solid ${theme.palette.success.main}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h2" sx={{ fontSize: '2.5rem' }}>
                  {getCountryFlag(selectedCountry)}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {countryConfig.data.name}
                    </Typography>
                    <CheckCircleIcon color="success" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Moneda: {countryConfig.availableCurrencies[0]?.name || 'N/A'} • 
                    Idioma: {countryConfig.language}
                  </Typography>
                </Box>
                <Button 
                  size="small" 
                  onClick={() => {
                    setSelectedCountry(null);
                    setCountryConfig(null);
                    setSelectedCity('');
                  }}
                >
                  Cambiar
                </Button>
              </Box>
            </Card>

            {/* Selector de ciudad */}
            {countryConfig.cities.length > 0 && (
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Ciudad (opcional)</InputLabel>
                <Select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  label="Ciudad (opcional)"
                  startAdornment={<LocationOnIcon sx={{ mr: 1, color: 'action.active' }} />}
                >
                  {countryConfig.cities.map((city) => (
                    <MenuItem key={city.code} value={city.code}>
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Información adicional */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Tu configuración afecta:</strong>
              </Typography>
              <Typography variant="body2" component="div">
                • Moneda en la que ves los precios
                <br />
                • Zona horaria para fechas de eventos
                <br />
                • Tipos de documento en formularios
                <br />
                <br />
                <em>Nota: Podrás ver y comprar eventos de cualquier país</em>
              </Typography>
            </Alert>

            {/* Botones de acción */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleConfirm}
                disabled={submitting}
                sx={{ 
                  minWidth: 200,
                  py: 1.5,
                  fontSize: '1.1rem',
                }}
              >
                {submitting ? <CircularProgress size={24} /> : 'Continuar'}
              </Button>
              {allowClose && (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => {
                    setSelectedCountry(null);
                    setCountryConfig(null);
                  }}
                >
                  Volver
                </Button>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

