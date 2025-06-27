import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const Reports: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Reportes
        </Typography>
        <Typography variant="body1">
          Aquí podrás generar y visualizar reportes del sistema.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Reports;
