'use client';

import BackofficeLayout from '@/components/layouts/BackofficeLayout';
import { Card, CardContent, Typography } from '@mui/material';

export default function CouponsPage() {
  return (
    <BackofficeLayout title="Promoción y cupones">
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cupones
          </Typography>
          <Typography color="text.secondary">
            Próximamente: gestión de cupones por evento, creación, límites, expiración y estadísticas de uso.
          </Typography>
        </CardContent>
      </Card>
    </BackofficeLayout>
  );
}