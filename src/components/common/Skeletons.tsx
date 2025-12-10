'use client';

import { Box, Card, CardContent, Skeleton, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

/**
 * [F2-004] Skeletons - Componentes de carga animados
 * 
 * GUÍA: Usar estos componentes en lugar de spinners cuando sea posible.
 * Los skeletons mejoran la percepción de velocidad y reducen el "layout shift".
 * 
 * Uso:
 * ```tsx
 * {loading ? <EventCardSkeleton /> : <EventCard event={event} />}
 * ```
 */

/**
 * Skeleton para tarjeta de evento (búsqueda, destacados)
 */
export function EventCardSkeleton() {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Imagen */}
      <Skeleton variant="rectangular" height={200} animation="wave" />
      
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Título */}
        <Skeleton variant="text" width="80%" height={32} animation="wave" />
        
        {/* Ubicación */}
        <Skeleton variant="text" width="60%" height={20} animation="wave" sx={{ mt: 1 }} />
        
        {/* Fecha */}
        <Skeleton variant="text" width="70%" height={20} animation="wave" />
        
        {/* Precio */}
        <Skeleton variant="text" width="40%" height={28} animation="wave" sx={{ mt: 1 }} />
      </CardContent>
    </Card>
  );
}

/**
 * Grid de skeletons para lista de eventos
 */
export function EventGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Grid container spacing={4}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
          <EventCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
}

/**
 * Skeleton para detalle de evento
 */
export function EventDetailSkeleton() {
  return (
    <Box>
      {/* Título */}
      <Skeleton variant="text" width="60%" height={48} animation="wave" sx={{ mb: 2 }} />
      
      <Grid container spacing={4}>
        {/* Columna principal */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Imagen */}
          <Skeleton 
            variant="rectangular" 
            height={400} 
            animation="wave" 
            sx={{ borderRadius: 2, mb: 3 }} 
          />
          
          {/* Descripción */}
          <Skeleton variant="text" width="30%" height={32} animation="wave" sx={{ mb: 2 }} />
          <Skeleton variant="text" width="100%" animation="wave" />
          <Skeleton variant="text" width="100%" animation="wave" />
          <Skeleton variant="text" width="80%" animation="wave" />
          
          {/* Info adicional */}
          <Box sx={{ mt: 4 }}>
            {[1, 2, 3].map((i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={40} height={40} animation="wave" sx={{ mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="30%" animation="wave" />
                  <Skeleton variant="text" width="50%" animation="wave" />
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>
        
        {/* Sidebar - Selección de tickets */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Skeleton variant="text" width="60%" height={32} animation="wave" sx={{ mb: 2 }} />
            
            {/* Tickets */}
            {[1, 2].map((i) => (
              <Paper key={i} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Skeleton variant="text" width="50%" animation="wave" />
                <Skeleton variant="text" width="30%" animation="wave" />
              </Paper>
            ))}
            
            {/* Botón */}
            <Skeleton variant="rectangular" height={48} animation="wave" sx={{ borderRadius: 1, mt: 2 }} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

/**
 * Skeleton para tabla (backoffice)
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            {Array.from({ length: columns }).map((_, i) => (
              <TableCell key={i}>
                <Skeleton variant="text" width={80 + Math.random() * 40} animation="wave" />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <TableRow key={rowIdx}>
              {Array.from({ length: columns }).map((_, colIdx) => (
                <TableCell key={colIdx}>
                  <Skeleton 
                    variant="text" 
                    width={60 + Math.random() * 80} 
                    animation="wave" 
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

/**
 * Skeleton para dashboard stats (cards)
 */
export function StatsCardSkeleton() {
  return (
    <Paper sx={{ p: 3 }}>
      <Skeleton variant="text" width="50%" height={24} animation="wave" />
      <Skeleton variant="text" width="40%" height={48} animation="wave" sx={{ mt: 1 }} />
    </Paper>
  );
}

/**
 * Grid de stats cards skeleton
 */
export function StatsGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid key={i} size={{ xs: 12, md: 4 }}>
          <StatsCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
}

/**
 * Skeleton para formulario de checkout
 */
export function CheckoutFormSkeleton() {
  return (
    <Box>
      {/* Resumen del evento */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="rectangular" width={80} height={60} animation="wave" sx={{ mr: 2, borderRadius: 1 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" animation="wave" />
            <Skeleton variant="text" width="40%" animation="wave" />
          </Box>
        </Box>
        <Skeleton variant="rectangular" height={1} animation="wave" sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Skeleton variant="text" width="30%" animation="wave" />
          <Skeleton variant="text" width="20%" animation="wave" />
        </Box>
      </Paper>
      
      {/* Campos del formulario */}
      <Paper sx={{ p: 3 }}>
        <Skeleton variant="text" width="40%" height={32} animation="wave" sx={{ mb: 2 }} />
        
        {[1, 2, 3].map((i) => (
          <Skeleton 
            key={i}
            variant="rectangular" 
            height={56} 
            animation="wave" 
            sx={{ borderRadius: 1, mb: 2 }} 
          />
        ))}
        
        <Skeleton 
          variant="rectangular" 
          height={48} 
          animation="wave" 
          sx={{ borderRadius: 1, mt: 3 }} 
        />
      </Paper>
    </Box>
  );
}

// Export por defecto para import conveniente
export default {
  EventCard: EventCardSkeleton,
  EventGrid: EventGridSkeleton,
  EventDetail: EventDetailSkeleton,
  Table: TableSkeleton,
  StatsCard: StatsCardSkeleton,
  StatsGrid: StatsGridSkeleton,
  CheckoutForm: CheckoutFormSkeleton,
};

