'use client';

import { Chip, Box, Tooltip } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import { ConfigService } from '@/services/ConfigService';

/**
 * MockModeIndicator - Muestra un indicador visual cuando la app está en modo mock
 * 
 * Solo visible en desarrollo cuando NEXT_PUBLIC_USE_MOCKS=true
 * 
 * Uso: Agregar en el layout principal
 * ```tsx
 * <MockModeIndicator />
 * ```
 */
export function MockModeIndicator() {
  // No mostrar en producción NUNCA
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  // No mostrar si mocks están deshabilitados
  if (!ConfigService.isMockedEnabled()) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        pointerEvents: 'auto',
      }}
    >
      <Tooltip 
        title="Los datos son simulados. El backend no está conectado." 
        arrow
        placement="left"
      >
        <Chip
          icon={<ScienceIcon />}
          label="MOCK MODE"
          color="warning"
          size="small"
          sx={{
            fontWeight: 'bold',
            fontSize: '0.7rem',
            boxShadow: 2,
            '& .MuiChip-icon': {
              fontSize: '1rem',
            },
          }}
        />
      </Tooltip>
    </Box>
  );
}

export default MockModeIndicator;

