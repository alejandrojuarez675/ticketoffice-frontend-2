// src/components/auth/AuthShell.tsx
'use client';

import { Container, Paper, Box, Typography } from '@mui/material';

export default function AuthShell({
  title,
  children,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Container component="main" maxWidth="xs" sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', py: 6 }}>
      <Paper
        elevation={6}
        sx={{
          p: { xs: 3, sm: 4 },
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Typography component="h1" variant="h5" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Box sx={{ width: '100%' }}>{children}</Box>
        {footer}
      </Paper>
    </Container>
  );
}
