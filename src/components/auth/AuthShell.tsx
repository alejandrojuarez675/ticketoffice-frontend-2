'use client';
import { Container, Paper, Box, Typography } from '@mui/material';

export default function AuthShell({
  title,
  children,
  footer,
  textColor = 'inherit', 
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  textColor?: string;
}) {
  return (
    <Container component="main" maxWidth="xs" sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 4 },
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          color: textColor,
          backgroundColor: 'transparent', 
        }}
      >
        <Typography component="h1" variant="h5">
          {title}
        </Typography>
        <Box sx={{ width: '100%' }}>{children}</Box>
        {footer}
      </Paper>
    </Container>
  );
}