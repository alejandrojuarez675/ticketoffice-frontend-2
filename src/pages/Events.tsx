import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const Events: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Gestión de Eventos
        </Typography>
        <Typography variant="body1">
          Aquí podrás gestionar todos los eventos disponibles.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Events;
