// src/components/forms/PasswordStrengthBar.tsx
'use client';

import { Box, LinearProgress, Typography } from '@mui/material';
import type { PasswordStrength } from '@/utils/password';

export default function PasswordStrengthBar({ strength }: { strength: PasswordStrength }) {
  const value = (strength.score / 4) * 100;
  return (
    <Box sx={{ mt: 1 }}>
      <LinearProgress variant="determinate" value={value} color={strength.color} sx={{ height: 8, borderRadius: 1, bgcolor: 'action.hover' }} />
      <Typography variant="caption" color="text.secondary">
        Fortaleza: {strength.label}
      </Typography>
    </Box>
  );
}
