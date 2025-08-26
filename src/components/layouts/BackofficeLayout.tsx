'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Box, CssBaseline, useMediaQuery, useTheme } from '@mui/material';
import Head from 'next/head';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/navigation/AdminSidebar';
import BackofficeBreadcrumbs from '@/components/layouts/BackofficeBreadcrumbs';
import Navbar from '@/components/navigation/Navbar';

type BackofficeLayoutProps = { children: ReactNode; title?: string };
const drawerWidth = 240;

export default function BackofficeLayout({ children, title = 'Admin - TicketOffice' }: BackofficeLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
        <meta name="description" content="TicketOffice Admin Panel" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
        <CssBaseline />
        {/* Public Navbar on top, with mobile menu controlling the admin sidebar */}
        <Navbar onMenuClick={handleDrawerToggle} />

        <Box sx={{ display: 'flex', flex: 1 }}>
          <AdminSidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle} isMobile={isMobile} />

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: { xs: 2, sm: 3 },
              width: { md: `calc(100% - ${drawerWidth}px)` },
              ml: { md: `${drawerWidth}px` },
              mt: { xs: '56px', sm: '64px' },
            }}
          >
            <BackofficeBreadcrumbs />
            {children}
          </Box>
        </Box>
      </Box>
    </>
  );
}