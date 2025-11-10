// src/components/common/Empty.tsx
'use client';

import React from 'react';
import { Box, Typography, Button } from '@mui/material';

interface EmptyProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  minHeight?: number | string;
}

export default function Empty({
  title = 'Sin resultados',
  description = 'No hay elementos para mostrar.',
  actionLabel,
  onAction,
  minHeight = '30vh',
}: EmptyProps) {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" minHeight={minHeight} textAlign="center">
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 520 }}>
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="contained" color="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}

