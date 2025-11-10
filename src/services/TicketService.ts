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
    qrLink: `${process.env.NEXT_PUBLIC_APP_URL ?? '<http://localhost:3000>'}/tickets/${id}`,
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
    // Cuando el BE exponga GET /api/public/v1/tickets/{id}, cámbialo a:
    // const base = ConfigService.getApiBase();
    // return http.get<Ticket>(`${base}/api/public/v1/tickets/${encodeURIComponent(id)}`);
    return ensureMockTicket(id);
  },

  // Usado en versiones previas; no se usa en el flujo MVP actual
  async issueTicketsForSession(sessionId: string): Promise<Ticket[]> {
    if (ConfigService.isMockedEnabled()) {
      const ids = [sessionId + '-1', sessionId + '-2'];
      return ids.map((id) => ensureMockTicket(id));
    }
    return [ensureMockTicket(sessionId + '-1')];
  },

  // Preparado para BE futuro
  async getPublic(id: string): Promise<Ticket> {
    return this.getTicketById(id);
  }
};
