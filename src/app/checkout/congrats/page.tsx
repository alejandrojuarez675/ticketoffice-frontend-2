"use client";
import React, { Suspense } from 'react';
import { Box, Button, Card, CardContent, Container, Link, List, ListItem, Typography } from '@mui/material';
import LightLayout from '@/components/layouts/LightLayout';
import { TicketService } from '@/services/TicketService';
import LinkNext from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function CheckoutCongratsPage() {
  return (
    <Suspense fallback={
      <LightLayout title="¡Gracias por tu compra!">
        <Container sx={{ py: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                ¡Felicitaciones!
              </Typography>
              <Typography color="text.secondary">Cargando...</Typography>
            </CardContent>
          </Card>
        </Container>
      </LightLayout>
    }>
      <CongratsInner />
    </Suspense>
  );
}

function CongratsInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId') ?? undefined;

  const [error, setError] = React.useState<string | null>(null);
  const [tickets, setTickets] = React.useState<Awaited<ReturnType<typeof TicketService.issueTicketsForSession>>>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    async function load() {
      if (!sessionId) {
        setError('Falta sessionId en la URL.');
        setLoading(false);
        return;
      }
      try {
        const res = await TicketService.issueTicketsForSession(sessionId);
        if (active) setTickets(res);
      } catch {
        if (active) setError('No se pudieron emitir las entradas.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [sessionId]);

  return (
    <LightLayout title="¡Gracias por tu compra!">
      <Container sx={{ py: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              ¡Felicitaciones!
            </Typography>
            <Typography color="text.secondary" paragraph>
              Tu compra fue procesada. Abajo puedes ver y abrir tus entradas.
            </Typography>

            {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
            {loading && !error && (
              <Typography color="text.secondary">Cargando entradas...</Typography>
            )}

            {!loading && !error && (
              <Box>
                <Typography variant="h6" gutterBottom>Entradas emitidas</Typography>
                <List>
                  {tickets.map((t) => (
                    <ListItem key={t.id} disableGutters>
                      <Link component={LinkNext} href={`/tickets/${t.id}`}>
                        {t.eventName} — Ticket #{t.id}
                      </Link>
                    </ListItem>
                  ))}
                </List>
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" component={LinkNext} href="/">
                    Ir al inicio
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </LightLayout>
  );
}
