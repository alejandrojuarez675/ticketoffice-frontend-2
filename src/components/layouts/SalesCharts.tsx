'use client';

import { Box, Typography } from '@mui/material';

export default function SalesCharts() {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        p: { xs: 2, sm: 3 },
        borderRadius: 2,
        boxShadow: 1,
        minHeight: 220,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Próximamente: Ventas por día, Ingresos totales y Top eventos.
      </Typography>
    </Box>
  );
}