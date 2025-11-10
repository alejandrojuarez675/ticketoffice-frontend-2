// src/services/CheckoutService.ts
import { ConfigService } from './ConfigService';
import { http } from '@/lib/http';
import { logger } from '@/lib/logger';

import type { CheckoutSessionResponse, SessionDataRequest, SessionInfoResponse, ProcessPaymentResponse, BuyerData } from '@/types/checkout';
import { CheckoutSessionResponseSchema } from './schemas/checkout';
import { mockCreateSession } from '@/mocks';

type CreateSessionRequest = {
  eventId: string;
  priceId: string;
  quantity: number;
};

type BuyTicketsRequest = {
  mainEmail: string;
  buyer: BuyerData[];
  couponCode?: string;
};

export class CheckoutService {
  private static BASE_URL = ConfigService.getApiBase();

  // Firma 1: (eventId, ticketId, quantity)
  static async createSession(eventId: string, ticketId: string, quantity: number): Promise<CheckoutSessionResponse>;
  // Firma 2: ({ eventId, priceId, quantity })
  static async createSession(payload: CreateSessionRequest): Promise<CheckoutSessionResponse>;

  static async createSession(a: string | CreateSessionRequest, b?: string, c?: number): Promise<CheckoutSessionResponse> {
    if (ConfigService.isMockedEnabled()) {
      return mockCreateSession();
    }

    const body: CreateSessionRequest =
      typeof a === 'string'
        ? { eventId: a, priceId: String(b), quantity: Number(c) }
        : a;

    const raw = await http.post<unknown>(`${this.BASE_URL}/api/public/v1/checkout/session`, body, { retries: 1 });
    const parsed = CheckoutSessionResponseSchema.parse(raw);
    logger.debug('createSession ok', parsed);
    return parsed;
  }

  // MVP: finalizar compra
  static async buy(sessionId: string, payload: BuyTicketsRequest): Promise<void> {
    await http.post<void, BuyTicketsRequest>(
      `${this.BASE_URL}/api/public/v1/checkout/session/${encodeURIComponent(sessionId)}/buy`,
      payload,
      { retries: 0 }
    );
    logger.info('buy ok', { sessionId });
  }

  // No disponible en MVP (los dejamos para no romper imports)
  static async getSession(_sessionId: string): Promise<SessionInfoResponse> {
    throw new Error('getSession no disponible en el MVP');
  }
  static async addSessionData(_sessionId: string, _data: SessionDataRequest): Promise<SessionInfoResponse> {
    throw new Error('addSessionData no disponible en el MVP');
  }
  static async processPayment(_sessionId: string): Promise<ProcessPaymentResponse> {
    throw new Error('processPayment no disponible en el MVP');
  }
}
