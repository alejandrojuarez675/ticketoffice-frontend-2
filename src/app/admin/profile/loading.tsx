import { Box, Card, CardContent, Skeleton, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';

export default function Loading() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
        <Skeleton width={220} height={40} />
      </Typography>
      <Grid container spacing={2}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 4 }}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width={140} height={20} />
                <Skeleton variant="text" width={80} height={48} />
                <Skeleton variant="rounded" width={160} height={28} sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
