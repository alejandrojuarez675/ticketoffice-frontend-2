import { ConfigService } from './ConfigService';
import type {
  CheckoutSessionResponse,
  SessionDataRequest,
  SessionInfoResponse,
  ProcessPaymentResponse,
} from '@/types/checkout';
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

    const response = await fetch(`${this.BASE_URL}/api/public/v1/checkout/session`, {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, priceId: ticketId, quantity }),
    });
    if (!response.ok) throw new Error(`Failed to create checkout session: ${response.status}`);
    return response.json();
  }

  static async getSession(sessionId: string): Promise<SessionInfoResponse> {
    if (ConfigService.isMockedEnabled()) {
      return mockGetSessionInfo(sessionId);
    }

    const response = await fetch(`${this.BASE_URL}/api/public/v1/checkout/session/${sessionId}`, {
      method: 'GET',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Failed to get session: ${response.status}`);
    return response.json();
  }

  static async addSessionData(sessionId: string, data: SessionDataRequest): Promise<SessionInfoResponse> {
    if (ConfigService.isMockedEnabled()) {
      return mockGetSessionInfoWithData(sessionId, data);
    }

    const response = await fetch(`${this.BASE_URL}/api/public/v1/checkout/session/${sessionId}/data`, {
      method: 'PUT',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Failed to update session data: ${response.status}`);
    return response.json();
  }

  static async processPayment(sessionId: string): Promise<ProcessPaymentResponse> {
    if (ConfigService.isMockedEnabled()) {
      return mockProcessPayment(sessionId);
    }

    const response = await fetch(`${this.BASE_URL}/api/public/v1/checkout/process-payment`, {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    if (!response.ok) throw new Error(`Failed to process payment: ${response.status}`);
    return response.json();
  }
}