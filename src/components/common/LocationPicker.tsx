// src/components/common/LocationPicker.tsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  Link,
} from '@mui/material';
import { LocationOn as LocationIcon, Map as MapIcon } from '@mui/icons-material';

interface LocationPickerProps {
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  onCoordinatesChange: (lat: number, lng: number) => void;
}

/**
 * Componente para seleccionar coordenadas de ubicación
 * 
 * Permite al usuario:
 * 1. Ver la dirección en Google Maps
 * 2. Copiar coordenadas desde Google Maps
 * 3. Pegar las coordenadas en el formulario
 */
export default function LocationPicker({
  address,
  city,
  country,
  latitude,
  longitude,
  onCoordinatesChange,
}: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  const [lat, setLat] = useState(latitude?.toString() || '');
  const [lng, setLng] = useState(longitude?.toString() || '');

  const fullAddress = `${address}, ${city}, ${country}`.trim();
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  const googleMapsViewUrl = latitude && longitude 
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : googleMapsSearchUrl;

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSave = () => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      alert('Por favor, ingresa coordenadas válidas');
      return;
    }

    if (latNum < -90 || latNum > 90) {
      alert('La latitud debe estar entre -90 y 90');
      return;
    }

    if (lngNum < -180 || lngNum > 180) {
      alert('La longitud debe estar entre -180 y 180');
      return;
    }

    onCoordinatesChange(latNum, lngNum);
    handleClose();
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<MapIcon />}
          onClick={handleOpen}
          disabled={!address || !city}
        >
          {latitude && longitude ? 'Editar ubicación en mapa' : 'Agregar ubicación en mapa'}
        </Button>
        
        {latitude && longitude && (
          <Button
            size="small"
            variant="text"
            startIcon={<LocationIcon />}
            component="a"
            href={googleMapsViewUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver en Google Maps
          </Button>
        )}
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Ubicación en el Mapa</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Cómo obtener las coordenadas:</strong>
            </Typography>
            <Typography variant="body2" component="ol" sx={{ pl: 2, mb: 0 }}>
              <li>Haz clic en "Abrir Google Maps" abajo</li>
              <li>Busca la ubicación exacta del evento</li>
              <li>Haz clic derecho en el punto exacto del mapa</li>
              <li>Selecciona las coordenadas (aparecen arriba) para copiarlas</li>
              <li>Pega las coordenadas aquí abajo</li>
            </Typography>
          </Alert>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Dirección:</strong> {fullAddress}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<MapIcon />}
              component="a"
              href={googleMapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              fullWidth
              sx={{ mb: 2 }}
            >
              Abrir Google Maps
            </Button>
          </Box>

          <TextField
            fullWidth
            label="Latitud"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            margin="normal"
            placeholder="-34.603722"
            helperText="Ejemplo: -34.603722 (para Buenos Aires)"
            type="number"
            inputProps={{ step: 'any' }}
          />

          <TextField
            fullWidth
            label="Longitud"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            margin="normal"
            placeholder="-58.381592"
            helperText="Ejemplo: -58.381592 (para Buenos Aires)"
            type="number"
            inputProps={{ step: 'any' }}
          />

          {lat && lng && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Vista previa:{' '}
                <Link
                  href={`https://www.google.com/maps?q=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver en Google Maps
                </Link>
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={!lat || !lng}>
            Guardar Coordenadas
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

