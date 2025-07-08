import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';

const Container = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: theme.spacing(3),
  padding: theme.spacing(2),
}));

const CardContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
}));

export const Dashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Container>
        <CardContainer>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Eventos Totales
              </Typography>
              <Typography variant="h3">15</Typography>
            </CardContent>
          </Card>
        </CardContainer>
        <CardContainer>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Boletos Vendidos
              </Typography>
              <Typography variant="h3">250</Typography>
            </CardContent>
          </Card>
        </CardContainer>
        <CardContainer>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ingresos Totales
              </Typography>
              <Typography variant="h3">$5,000</Typography>
            </CardContent>
          </Card>
        </CardContainer>
        <CardContainer>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Usuarios Activos
              </Typography>
              <Typography variant="h3">100</Typography>
            </CardContent>
          </Card>
        </CardContainer>
      </Container>
    </Box>
  );
};

export default Dashboard;
