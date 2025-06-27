import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const Tickets: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Gestión de Boletos
        </Typography>
        <Typography variant="body1">
          Aquí podrás gestionar todos los boletos disponibles.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Tickets;
