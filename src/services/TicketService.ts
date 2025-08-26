import { ConfigService } from './ConfigService';

export type Ticket = {
  id: string;
  orderId: string;
  eventId: string;
  eventName: string;
  buyerName: string;
  buyerEmail: string;
  qrLink: string;
  issuedAt: string;
};

const mockTickets: Record<string, Ticket> = {};

function ensureMockTicket(id: string): Ticket {
  if (mockTickets[id]) return mockTickets[id];
  const t: Ticket = {
    id,
    orderId: 'ord_' + id,
    eventId: 'evt_vip_1',
    eventName: 'VIP Experience',
    buyerName: 'Juan Pérez',
    buyerEmail: 'buyer@example.com',
    qrLink: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/tickets/${id}`,
    issuedAt: new Date().toISOString(),
  };
  mockTickets[id] = t;
  return t;
}

export const TicketService = {
  async getTicketById(id: string): Promise<Ticket> {
    if (ConfigService.isMockedEnabled()) {
      return ensureMockTicket(id);
    }
    // Replace with real API call when available
    return ensureMockTicket(id);
  },

  async issueTicketsForSession(sessionId: string): Promise<Ticket[]> {
    if (ConfigService.isMockedEnabled()) {
      const ids = [sessionId + '-1', sessionId + '-2'];
      return ids.map((id) => ensureMockTicket(id));
    }
    // Replace with real API call when available
    return [ensureMockTicket(sessionId + '-1')];
  },
};
