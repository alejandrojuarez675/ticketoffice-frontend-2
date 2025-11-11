import { Box, Card, CardContent, Skeleton } from '@mui/material';
import Grid from '@mui/material/Grid';

export default function Loading() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Skeleton variant="circular" width={36} height={36} />
        <Skeleton variant="text" width={220} height={40} />
        <Box sx={{ flexGrow: 1 }} />
        <Skeleton variant="rounded" width={160} height={36} />
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Skeleton variant="text" width={180} height={28} />
              <Skeleton variant="rounded" height={56} sx={{ mt: 2 }} />
              <Skeleton variant="rounded" height={120} sx={{ mt: 2 }} />
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Skeleton variant="rounded" height={56} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Skeleton variant="rounded" height={56} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="text" width={140} height={28} />
                <Skeleton variant="rounded" width={160} height={32} />
              </Box>
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Skeleton variant="rounded" height={40} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Skeleton variant="rounded" height={40} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Skeleton variant="rounded" height={40} />
                      <Skeleton variant="rounded" height={28} sx={{ mt: 2, width: 180 }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Skeleton variant="rounded" height={40} />
                    </Grid>
                  </Grid>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Skeleton variant="text" width={200} height={28} />
              <Skeleton variant="rounded" height={56} sx={{ mt: 2 }} />
              <Skeleton variant="rounded" height={56} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Skeleton variant="text" width={160} height={28} />
              <Skeleton variant="rounded" height={56} sx={{ mt: 2 }} />
              <Skeleton variant="text" width={240} height={20} sx={{ mt: 1 }} />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Skeleton variant="text" width={160} height={28} />
              <Skeleton variant="rounded" height={56} sx={{ mt: 2 }} />
              <Skeleton variant="rounded" height={56} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
