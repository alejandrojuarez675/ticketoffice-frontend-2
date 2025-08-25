'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';


export default function AdminIndexRedirect() {
  const router = useRouter();
  const { isLoading, isAuthenticated, isAdmin, hasBackofficeAccess } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/auth/login?next=/admin');
      return;
    }

    if (!hasBackofficeAccess) {
      router.replace('/');
      return;
    }

    // admin -> dashboard, seller -> profile
    router.replace(isAdmin ? '/admin/dashboard' : '/admin/profile');
  }, [isLoading, isAuthenticated, isAdmin, hasBackofficeAccess, router]);

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );
}