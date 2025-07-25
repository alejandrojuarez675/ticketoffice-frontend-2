'use client';

import React, { useEffect, useState } from 'react';
import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AuthService } from '@/services/AuthService';

// Styled components
const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
  gap: theme.spacing(3),
  marginTop: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const StatCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  '&:last-child': {
    paddingBottom: theme.spacing(2),
  },
}));

// Mock data service (in a real app, this would be an API call)
const fetchDashboardStats = async () => {
  // Simulate API call
  return new Promise<{
    totalEvents: number;
    ticketsSold: number;
    totalRevenue: number;
    activeUsers: number;
  }>((resolve) => {
    setTimeout(() => {
      resolve({
        totalEvents: 15,
        ticketsSold: 250,
        totalRevenue: 5000,
        activeUsers: 100,
      });
    }, 500);
  });
};

function DashboardContent() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    ticketsSold: 0,
    totalRevenue: 0,
    activeUsers: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!AuthService.isAuthenticated()) {
        router.push('/auth/login');
        return;
      }
      
      if (!AuthService.isAdmin()) {
        router.push('/');
        return;
      }
      
      try {
        setLoading(true);
        const dashboardStats = await fetchDashboardStats();
        setStats(dashboardStats);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
        setError('Error al cargar las estadísticas del panel');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <DashboardContainer>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ 
          fontWeight: 'bold',
          color: theme.palette.primary.main,
          mb: 4,
          [theme.breakpoints.down('sm')]: {
            fontSize: '1.75rem',
          },
        }}
      >
        Panel de Control
      </Typography>
      
      <Typography 
        variant="subtitle1" 
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        Resumen general de las actividades y estadísticas
      </Typography>
      
      <StatsContainer>
        <StatCard>
          <StatCardContent>
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              gutterBottom
              sx={{ fontWeight: 'medium' }}
            >
              Eventos Totales
            </Typography>
            <Typography 
              variant="h3" 
              component="div"
              sx={{ 
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                mt: 'auto',
              }}
            >
              {stats.totalEvents.toLocaleString()}
            </Typography>
          </StatCardContent>
        </StatCard>
        
        <StatCard>
          <StatCardContent>
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              gutterBottom
              sx={{ fontWeight: 'medium' }}
            >
              Boletos Vendidos
            </Typography>
            <Typography 
              variant="h3" 
              component="div"
              sx={{ 
                fontWeight: 'bold',
                color: theme.palette.success.main,
                mt: 'auto',
              }}
            >
              {stats.ticketsSold.toLocaleString()}
            </Typography>
          </StatCardContent>
        </StatCard>
        
        <StatCard>
          <StatCardContent>
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              gutterBottom
              sx={{ fontWeight: 'medium' }}
            >
              Ingresos Totales
            </Typography>
            <Typography 
              variant="h3" 
              component="div"
              sx={{ 
                fontWeight: 'bold',
                color: theme.palette.info.main,
                mt: 'auto',
              }}
            >
              ${stats.totalRevenue.toLocaleString()}
            </Typography>
          </StatCardContent>
        </StatCard>
        
        <StatCard>
          <StatCardContent>
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              gutterBottom
              sx={{ fontWeight: 'medium' }}
            >
              Usuarios Activos
            </Typography>
            <Typography 
              variant="h3" 
              component="div"
              sx={{ 
                fontWeight: 'bold',
                color: theme.palette.warning.main,
                mt: 'auto',
              }}
            >
              {stats.activeUsers.toLocaleString()}
            </Typography>
          </StatCardContent>
        </StatCard>
      </StatsContainer>
      
      {/* Add more dashboard widgets here */}
      <Box mt={6}>
        <Typography variant="h6" gutterBottom>
          Actividad Reciente
        </Typography>
        <Box 
          bgcolor="background.paper" 
          p={3} 
          borderRadius={2}
          boxShadow={1}
        >
          <Typography color="text.secondary">
            Próximamente: Gráficos y actividad reciente
          </Typography>
        </Box>
      </Box>
    </DashboardContainer>
  );
}

export default function DashboardPage() {
  return (
    <BackofficeLayout title="Panel de Control">
      <DashboardContent />
    </BackofficeLayout>
  );
}
