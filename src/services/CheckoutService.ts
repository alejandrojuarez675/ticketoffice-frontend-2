// src/services/CheckoutService.ts
import { ConfigService } from './ConfigService';
import { http } from '@/lib/http';
import { logger } from '@/lib/logger';

import type { CheckoutSessionResponse, SessionDataRequest, SessionInfoResponse, ProcessPaymentResponse, BuyerData } from '@/types/checkout';
import { CheckoutSessionResponseSchema } from './schemas/checkout';
import { 
  mockCreateSession, 
  mockGetSessionInfo, 
  mockGetSessionInfoWithData, 
  mockProcessPayment,
  mockBuyFree 
} from '@/mocks';

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
    const body: CreateSessionRequest =
      typeof a === 'string'
        ? { eventId: a, priceId: String(b), quantity: Number(c) }
        : a;

    // Mock primero
    if (ConfigService.isMockedEnabled()) {
      logger.debug('createSession [MOCK]', body);
      return mockCreateSession(body.eventId, body.priceId, body.quantity);
    }

    // API real
    const raw = await http.post<unknown>(`${this.BASE_URL}/api/public/v1/checkout/session`, body, { retries: 1 });
    const parsed = CheckoutSessionResponseSchema.parse(raw);
    logger.debug('createSession ok', parsed);
    return parsed;
  }

  /**
   * Finalizar compra (para entradas gratuitas o después del pago)
   */
  static async buy(sessionId: string, payload: BuyTicketsRequest): Promise<void> {
    // Mock primero
    if (ConfigService.isMockedEnabled()) {
      logger.debug('buy [MOCK]', { sessionId });
      await mockBuyFree(sessionId, payload);
      return;
    }

    // API real
    await http.post<void, BuyTicketsRequest>(
      `${this.BASE_URL}/api/public/v1/checkout/session/${encodeURIComponent(sessionId)}/buy`,
      payload,
      { retries: 0 }
    );
    logger.info('buy ok', { sessionId });
  }

  /**
   * Obtener información de la sesión
   */
  static async getSession(sessionId: string): Promise<SessionInfoResponse> {
    // Mock primero
    if (ConfigService.isMockedEnabled()) {
      logger.debug('getSession [MOCK]', { sessionId });
      return mockGetSessionInfo(sessionId);
    }

    // API real (cuando exista el endpoint)
    const raw = await http.get<unknown>(
      `${this.BASE_URL}/api/public/v1/checkout/session/${encodeURIComponent(sessionId)}`,
      { retries: 1 }
    );
    return raw as SessionInfoResponse;
  }

  /**
   * Guardar datos del comprador en la sesión
   */
  static async addSessionData(sessionId: string, data: SessionDataRequest): Promise<SessionInfoResponse> {
    // Mock primero
    if (ConfigService.isMockedEnabled()) {
      logger.debug('addSessionData [MOCK]', { sessionId, data });
      return mockGetSessionInfoWithData(sessionId, data);
    }

    // API real (cuando exista el endpoint)
    const raw = await http.post<unknown>(
      `${this.BASE_URL}/api/public/v1/checkout/session/${encodeURIComponent(sessionId)}/data`,
      data,
      { retries: 0 }
    );
    return raw as SessionInfoResponse;
  }

  /**
   * Procesar pago (redirige a MercadoPago o simula en mock)
   * 
   * En mock: Simula el flujo completo de pago
   * En real: Llama al backend para crear preferencia de MercadoPago
   */
  static async processPayment(sessionId: string): Promise<ProcessPaymentResponse> {
    // Mock primero - SIMULA EL PAGO COMPLETO
    if (ConfigService.isMockedEnabled()) {
      logger.debug('processPayment [MOCK]', { sessionId });
      const result = await mockProcessPayment(sessionId);
      
      if (!result.success) {
        logger.warn('processPayment [MOCK] failed', { sessionId, error: result.error });
      } else {
        logger.info('processPayment [MOCK] success', { sessionId, redirectUrl: result.redirectUrl });
      }
      
      return result;
    }

    // API real (cuando exista el endpoint)
    const raw = await http.post<ProcessPaymentResponse>(
      `${this.BASE_URL}/api/public/v1/checkout/session/${encodeURIComponent(sessionId)}/process-payment`,
      {
        returnUrls: {
          success: `${ConfigService.getAppUrl()}/checkout/congrats?sessionId=${sessionId}`,
          failure: `${ConfigService.getAppUrl()}/checkout/${sessionId}?status=failure`,
          pending: `${ConfigService.getAppUrl()}/checkout/${sessionId}?status=pending`,
        },
      },
      { retries: 0 }
    );
    
    logger.info('processPayment ok', { sessionId });
    return raw;
  }
}
