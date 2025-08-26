"use client";

import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';

interface ErrorStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onRetry?: () => void;
  minHeight?: number | string;
}

export default function ErrorState({
  title = 'Ocurrió un error',
  message = 'No pudimos completar la acción. Inténtalo nuevamente.',
  actionLabel = 'Reintentar',
  onRetry,
  minHeight = '30vh',
}: ErrorStateProps) {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" minHeight={minHeight} textAlign="center">
      <Alert severity="error" sx={{ width: '100%', maxWidth: 520, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2">{message}</Typography>
      </Alert>
      {onRetry && (
        <Button variant="contained" color="primary" onClick={onRetry}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
