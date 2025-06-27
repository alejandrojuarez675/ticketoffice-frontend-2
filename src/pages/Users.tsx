import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const Users: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Gestión de Usuarios
        </Typography>
        <Typography variant="body1">
          Aquí podrás gestionar los usuarios del sistema.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Users;
