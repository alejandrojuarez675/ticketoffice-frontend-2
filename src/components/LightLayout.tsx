import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, AppBar, Toolbar, Typography, Container } from '@mui/material';
import { theme } from '../theme';

interface LightLayoutProps {
  children: React.ReactNode;
}

const LightLayout: React.FC<LightLayoutProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>TicketOffice</a>
            </Typography>
          </Toolbar>
        </AppBar>
        <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1, maxWidth: 'sm' }}>
          {children}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default LightLayout;
