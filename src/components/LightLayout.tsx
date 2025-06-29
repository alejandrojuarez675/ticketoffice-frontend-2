import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, AppBar, Toolbar, Typography, Button, Container, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { theme } from '../theme';
import Footer from './Footer';

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
        {children}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Footer />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default LightLayout;
