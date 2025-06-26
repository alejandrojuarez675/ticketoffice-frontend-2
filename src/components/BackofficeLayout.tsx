import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { theme } from '../theme';

interface BackofficeLayoutProps {
  children: React.ReactNode;
}

export const BackofficeLayout: React.FC<BackofficeLayoutProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Ticket Office Admin
            </Typography>
            <Button color="inherit">Login</Button>
          </Toolbar>
        </AppBar>
        <Container component="main" sx={{ mt: 4, mb: 4 }}>
          {children}
        </Container>
      </Box>
    </ThemeProvider>
  );
};
