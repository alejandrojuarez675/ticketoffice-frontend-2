// src/components/layouts/BackofficeLayout.tsx
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Box, CssBaseline, useMediaQuery, useTheme, Container } from '@mui/material';
import Head from 'next/head';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/navigation/AdminSidebar';
import BackofficeBreadcrumbs from '@/components/layouts/BackofficeBreadcrumbs';
import Navbar from '@/components/navigation/Navbar';
import Footer from '@/components/navigation/Footer';

type BackofficeLayoutProps = { children: ReactNode; title?: string };
const drawerWidth = 240;

export default function BackofficeLayout({ children, title = 'Admin - TuEntradaYa' }: BackofficeLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px
  const [mobileOpen, setMobileOpen] = useState(false);

  const { isLoading, isAuthenticated, hasBackofficeAccess } = useAuth();
  const router = useRouter();

  const handleDrawerToggle = () => setMobileOpen((v) => !v);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/auth/login?next=/admin/profile');
      return;
    }
    if (!hasBackofficeAccess) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, hasBackofficeAccess, router]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="TuEntradaYa Admin Panel" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <CssBaseline />
        <Navbar onMenuClick={handleDrawerToggle} />

        <Box sx={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 56px)' }}>
          <AdminSidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle} isMobile={isMobile} />

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              width: '100%',
              mt: { xs: '56px', sm: '64px' },
              display: 'flex',
              flexDirection: 'column',
              // Sin margin-left: el contenido se ajusta automáticamente con flexGrow
              overflow: 'hidden',
            }}
          >
            <Container 
              maxWidth="xl" 
              sx={{ 
                py: { xs: 2, sm: 3 },
                px: { xs: 2, sm: 3 },
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <BackofficeBreadcrumbs />
              <Box sx={{ flexGrow: 1, mt: 2 }}>
                {children}
              </Box>
            </Container>
          </Box>
        </Box>
        
        <Box component="footer">
          <Footer />
        </Box>
      </Box>
    </>
  );
}
