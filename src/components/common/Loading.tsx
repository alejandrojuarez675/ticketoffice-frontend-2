// src/components/common/Loading.tsx
'use client';

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingProps {
  label?: string;
  minHeight?: number | string;
  size?: number;
}

export default function Loading({ label = 'Cargando...', minHeight = '40vh', size = 40 }: LoadingProps) {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" minHeight={minHeight}>
      <CircularProgress size={size} />
      {label && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {label}
        </Typography>
      )}
    </Box>
  );
}

