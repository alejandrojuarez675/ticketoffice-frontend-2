'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Button, Typography, Alert, CircularProgress, IconButton } from '@mui/material';
import { Close as CloseIcon, FlipCameraIos as FlipCameraIcon, FlashOn as FlashOnIcon, FlashOff as FlashOffIcon } from '@mui/icons-material';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (saleId: string) => void;
  onClose: () => void;
}

function extractSaleIdFromUrl(qrData: string): string | null {
  try {
    const url = new URL(qrData);
    
    const saleId = url.searchParams.get('sale-id') || url.searchParams.get('saleId');
    
    if (saleId) {
      return saleId;
    }
    
    return null;
  } catch {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(qrData.trim())) {
      return qrData.trim();
    }
    return null;
  }
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const hasScannedRef = useRef(false);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING) {
          await scannerRef.current.stop();
        }
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
    }
  }, []);

  const handleScanSuccess = useCallback((decodedText: string) => {
    if (hasScannedRef.current) return;
    hasScannedRef.current = true;

    const saleId = extractSaleIdFromUrl(decodedText);

    if (saleId) {
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }

      stopScanner().then(() => {
        onScan(saleId);
      });
    } else {
      setError(`QR inválido: no se encontró sale-id en "${decodedText}"`);
      hasScannedRef.current = false;
    }
  }, [onScan, stopScanner]);

  const startScanner = useCallback(async () => {
    if (!containerRef.current) return;

    setError('');
    setIsInitializing(true);
    hasScannedRef.current = false;

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader-container');
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
      };

      await scannerRef.current.start(
        { facingMode },
        config,
        handleScanSuccess,
        () => {}
      );

      setIsScanning(true);
      setIsInitializing(false);

      try {
        const capabilities = scannerRef.current.getRunningTrackCameraCapabilities();
        if (capabilities.torchFeature && capabilities.torchFeature().isSupported()) {
          setHasTorch(true);
        }
      } catch {
        setHasTorch(false);
      }

    } catch (err) {
      console.error('Error starting scanner:', err);
      setIsInitializing(false);
      
      if (err instanceof Error) {
        if (err.message.includes('Permission denied') || err.message.includes('NotAllowedError')) {
          setError('Permiso de cámara denegado. Por favor, permite el acceso a la cámara en la configuración de tu navegador.');
        } else if (err.message.includes('NotFoundError') || err.message.includes('DevicesNotFoundError')) {
          setError('No se encontró ninguna cámara en este dispositivo.');
        } else if (err.message.includes('NotReadableError') || err.message.includes('TrackStartError')) {
          setError('La cámara está siendo usada por otra aplicación. Ciérrala e intenta de nuevo.');
        } else {
          setError(`Error al iniciar la cámara: ${err.message}`);
        }
      } else {
        setError('Error desconocido al iniciar la cámara.');
      }
    }
  }, [facingMode, handleScanSuccess]);

  useEffect(() => {
    startScanner();

    return () => {
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  const handleFlipCamera = async () => {
    await stopScanner();
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    setIsScanning(false);
    setTimeout(() => {
      startScanner();
    }, 300);
  };

  const handleToggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;

    try {
      const capabilities = scannerRef.current.getRunningTrackCameraCapabilities();
      if (capabilities.torchFeature) {
        const torch = capabilities.torchFeature();
        if (torchEnabled) {
          await torch.disable();
        } else {
          await torch.enable();
        }
        setTorchEnabled(!torchEnabled);
      }
    } catch (err) {
      console.warn('Error toggling torch:', err);
    }
  };

  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'rgba(0, 0, 0, 0.95)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 500, p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6" color="white">
            📷 Escanear QR
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {hasTorch && (
              <IconButton
                onClick={handleToggleTorch}
                sx={{
                  bgcolor: torchEnabled ? 'warning.main' : 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': { bgcolor: torchEnabled ? 'warning.dark' : 'rgba(255,255,255,0.3)' },
                }}
              >
                {torchEnabled ? <FlashOnIcon /> : <FlashOffIcon />}
              </IconButton>
            )}
            <IconButton
              onClick={handleFlipCamera}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              }}
            >
              <FlipCameraIcon />
            </IconButton>
            <IconButton
              onClick={handleClose}
              sx={{
                bgcolor: 'error.main',
                color: 'white',
                '&:hover': { bgcolor: 'error.dark' },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1',
            bgcolor: 'black',
            borderRadius: 2,
            overflow: 'hidden',
            border: '3px solid',
            borderColor: isScanning ? 'success.main' : 'primary.main',
          }}
        >
          <div
            id="qr-reader-container"
            ref={containerRef}
            style={{
              width: '100%',
              height: '100%',
            }}
          />

          {isInitializing && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(0, 0, 0, 0.8)',
              }}
            >
              <CircularProgress color="primary" size={48} />
              <Typography variant="body1" color="white" sx={{ mt: 2 }}>
                Iniciando cámara...
              </Typography>
            </Box>
          )}

          {isScanning && !isInitializing && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                px: 2,
                py: 1,
                borderRadius: 1,
              }}
            >
              <CircularProgress size={16} color="success" />
              <Typography variant="body2">Buscando QR...</Typography>
            </Box>
          )}
        </Box>

        <Typography variant="body2" color="white" align="center" sx={{ mt: 2 }}>
          Centra el código QR dentro del marco para escanearlo automáticamente
        </Typography>

        <Button
          variant="contained"
          color="error"
          onClick={handleClose}
          fullWidth
          sx={{ mt: 2 }}
          startIcon={<CloseIcon />}
        >
          Cancelar
        </Button>
      </Box>
    </Box>
  );
}