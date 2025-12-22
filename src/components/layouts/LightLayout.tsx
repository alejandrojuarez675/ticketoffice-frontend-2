// src/components/layouts/LightLayout.tsx
'use client';

import { type ReactNode } from 'react';
import { Box } from '@mui/material';
import Head from 'next/head';
import Navbar from '@/components/navigation/Navbar';
import Footer from '@/components/navigation/Footer';

type LightLayoutProps = {
  children: ReactNode;
  title?: string;
};

export default function LightLayout({ children, title = 'TuEntradaYa' }: LightLayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="TuEntradaYa - Your event ticketing platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Box 
          component="main" 
          sx={{ 
            minHeight: 'calc(100vh - 56px)', 
            mt: { xs: '56px', sm: '64px' },
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            {children}
          </Box>
        </Box>
        <Footer />
      </Box>
    </>
  );
}
