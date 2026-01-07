import { Box, Card, CardContent, Container, Typography } from '@mui/material';
import LightLayout from '@/components/layouts/LightLayout';
import { TicketService } from '@/services/TicketService';
import { redirect } from 'next/navigation';
import { isValidId } from '@/utils/validation';

export default async function TicketDetailPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  
  // Validar ticketId - redirigir si es inválido
  if (!ticketId || !isValidId(ticketId)) {
    redirect('/');
  }
  
  const ticket = await TicketService.getTicketById(ticketId);

  return (
    <LightLayout title={`Ticket ${ticket.id}`}>
      <Container sx={{ py: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {ticket.eventName}
            </Typography>
            <Typography>ID de ticket: {ticket.id}</Typography>
            <Typography>Orden: {ticket.orderId}</Typography>
            <Typography>Comprador: {ticket.buyerName} ({ticket.buyerEmail})</Typography>
            <Typography>Emitido: {new Date(ticket.issuedAt).toLocaleString()}</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">QR:</Typography>
              <Typography variant="body2" color="text.secondary">
                {ticket.qrLink}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </LightLayout>
  );
}
