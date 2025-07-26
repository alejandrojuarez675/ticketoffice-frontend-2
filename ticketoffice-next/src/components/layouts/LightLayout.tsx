import { ReactNode } from 'react';
import { Box } from '@mui/material';
import Head from 'next/head';
import Navbar from '@/components/navigation/Navbar';
import Footer from '@/components/navigation/Footer';

type LightLayoutProps = {
  children: ReactNode;
  title?: string;
};

export default function LightLayout({ children, title = 'TicketOffice' }: LightLayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="TicketOffice - Your event ticketing platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1 }}>
          {children}
        </Box>
        <Footer />
      </Box>
    </>
  );
}
