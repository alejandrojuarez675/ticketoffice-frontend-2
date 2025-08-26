import { Box, Card, CardContent, Skeleton, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

export default function Loading() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Skeleton variant="text" width={260} height={40} />
        <Skeleton variant="rounded" width={140} height={36} />
      </Box>

      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><Skeleton width={120} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell><Skeleton width={110} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell align="right"><Skeleton width={80} /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton width="80%" /></TableCell>
                  <TableCell><Skeleton width="70%" /></TableCell>
                  <TableCell><Skeleton width="60%" /></TableCell>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell align="right"><Skeleton variant="circular" width={36} height={36} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
