// src/app/admin/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import { useAuth } from '@/app/contexts/AuthContext';

export default function AdminIndexRedirect() {
  const router = useRouter();
  const { isLoading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/auth/login?next=/admin');
      return;
    }

    const isAdmin = user?.role === 'admin';
    const hasBackofficeAccess = user?.role === 'admin' || user?.role === 'seller';

    if (!hasBackofficeAccess) {
      router.replace('/');
      return;
    }

    router.replace(isAdmin ? '/admin/dashboard' : '/admin/profile');
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <BackofficeLayout title="Redirigiendo...">
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    </BackofficeLayout>
  );
}
