import { ConfigService } from './ConfigService';
import { http } from '@/lib/http';
import { logger } from '@/lib/logger';

import type {
  CheckoutSessionResponse,
  SessionDataRequest,
  SessionInfoResponse,
  ProcessPaymentResponse,
} from '@/types/checkout';
import {
  CheckoutSessionResponseSchema,
  SessionDataRequestSchema,
  SessionInfoResponseSchema,
  ProcessPaymentResponseSchema,
} from './schemas/checkout';
import {
  mockCreateSession,
  mockGetSessionInfo,
  mockGetSessionInfoWithData,
  mockProcessPayment,
} from '@/mocks';

export class CheckoutService {
  private static BASE_URL = ConfigService.getApiBase();

  static async createSession(eventId: string, ticketId: string, quantity: number): Promise<CheckoutSessionResponse> {
    if (ConfigService.isMockedEnabled()) {
      return mockCreateSession();
    }

    const raw = await http.post<unknown>(
      `${this.BASE_URL}/api/public/v1/checkout/session`,
      { eventId, priceId: ticketId, quantity },
      { retries: 2 }
    );
    const parsed = CheckoutSessionResponseSchema.parse(raw);
    logger.debug('createSession: parsed response', parsed);
    return parsed;
  }

  static async getSession(sessionId: string): Promise<SessionInfoResponse> {
    if (ConfigService.isMockedEnabled()) {
      return mockGetSessionInfo(sessionId);
    }

    const raw = await http.get<unknown>(
      `${this.BASE_URL}/api/public/v1/checkout/session/${sessionId}`,
      { retries: 2 }
    );
    const parsed = SessionInfoResponseSchema.parse(raw);
    logger.debug('getSession: parsed response', parsed);
    return parsed;
  }

  static async addSessionData(sessionId: string, data: SessionDataRequest): Promise<SessionInfoResponse> {
    if (ConfigService.isMockedEnabled()) {
      return mockGetSessionInfoWithData(sessionId, data);
    }
    // validate request shape before sending
    const validReq = SessionDataRequestSchema.parse(data);

    const raw = await http.put<unknown>(
      `${this.BASE_URL}/api/public/v1/checkout/session/${sessionId}/data`,
      validReq,
      { retries: 1 }
    );
    const parsed = SessionInfoResponseSchema.parse(raw);
    logger.debug('addSessionData: parsed response', parsed);
    return parsed;
  }

  static async processPayment(sessionId: string): Promise<ProcessPaymentResponse> {
    if (ConfigService.isMockedEnabled()) {
      return mockProcessPayment(sessionId);
    }

    const raw = await http.post<unknown>(
      `${this.BASE_URL}/api/public/v1/checkout/process-payment`,
      { sessionId },
      { retries: 1 }
    );
    const parsed = ProcessPaymentResponseSchema.parse(raw);
    logger.debug('processPayment: parsed response', parsed);
    return parsed;
  }
}