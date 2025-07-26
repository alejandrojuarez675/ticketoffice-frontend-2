import { ReactNode, useState } from 'react';
import { Box, CssBaseline, useMediaQuery, useTheme } from '@mui/material';
import Head from 'next/head';
import AdminSidebar from '@/components/navigation/AdminSidebar';
import AdminTopBar from '@/components/navigation/AdminTopBar';

type BackofficeLayoutProps = {
  children: ReactNode;
  title?: string;
};

export default function BackofficeLayout({ children, title = 'Admin - TicketOffice' }: BackofficeLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="TicketOffice Admin Panel" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline />
        <AdminTopBar onMenuClick={handleDrawerToggle} />
        <AdminSidebar 
          mobileOpen={mobileOpen} 
          onClose={handleDrawerToggle} 
          isMobile={isMobile} 
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${theme.spacing(30)})` },
            ml: { sm: theme.spacing(30) },
            mt: 8, // Space for the top bar
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  );
}
