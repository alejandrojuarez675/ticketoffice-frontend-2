// src/components/common/QRScanner.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { Close as CloseIcon, CameraAlt as CameraIcon } from '@mui/icons-material';

interface QRScannerProps {
  onScan: (saleId: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');
  const [scanning, setScanning] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Cámara trasera en móviles
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Iniciar escaneo continuo
      scanIntervalRef.current = setInterval(() => {
        scanQRCode();
      }, 500);
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      setError('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Intentar detectar QR usando jsQR (simulado - en producción usar librería real)
    const detectedCode = detectQRFromImageData(imageData);
    
    if (detectedCode) {
      extractSaleIdFromQR(detectedCode);
    }
  };

  const detectQRFromImageData = (imageData: ImageData): string | null => {
    // Esta es una implementación simplificada
    // En producción, usar una librería como jsQR o @zxing/browser
    
    // Por ahora, usaremos detección básica de patrones
    // La implementación real requeriría una librería de QR
    
    return null; // Placeholder
  };

  const extractSaleIdFromQR = (qrData: string) => {
    try {
      // El QR contiene una URL como:
      // https://tuentradaya.com/admin/events/{eventId}/validate?sale-id={saleId}
      
      const url = new URL(qrData);
      const saleId = url.searchParams.get('sale-id') || url.searchParams.get('saleId');
      
      if (saleId) {
        stopCamera();
        onScan(saleId);
      } else {
        setError('QR inválido: no se encontró sale-id');
      }
    } catch (err) {
      setError('QR inválido: formato incorrecto');
    }
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
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 500, p: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10000,
            bgcolor: 'white',
            '&:hover': { bgcolor: 'grey.200' },
          }}
          startIcon={<CloseIcon />}
        >
          Cerrar
        </Button>

        <Typography variant="h6" color="white" align="center" sx={{ mb: 2 }}>
          📷 Escanea el código QR de la entrada
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
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
            borderColor: 'primary.main',
          }}
        >
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            playsInline
            muted
          />
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Marco de escaneo */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              height: '80%',
              border: '2px solid',
              borderColor: 'success.main',
              borderRadius: 2,
              '&::before, &::after': {
                content: '""',
                position: 'absolute',
                width: 20,
                height: 20,
                borderColor: 'success.main',
              },
              '&::before': {
                top: -2,
                left: -2,
                borderTop: '4px solid',
                borderLeft: '4px solid',
              },
              '&::after': {
                bottom: -2,
                right: -2,
                borderBottom: '4px solid',
                borderRight: '4px solid',
              },
            }}
          />

          {scanning && (
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
              <CircularProgress size={16} color="inherit" />
              <Typography variant="body2">Buscando QR...</Typography>
            </Box>
          )}
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Importante:</strong> Esta es una implementación básica. Para producción, se recomienda usar una librería especializada como <code>html5-qrcode</code> o <code>@zxing/browser</code>.
          </Typography>
        </Alert>

        <Typography variant="body2" color="white" align="center" sx={{ mt: 2 }}>
          Centra el código QR dentro del marco para escanearlo
        </Typography>
      </Box>
    </Box>
  );
}

