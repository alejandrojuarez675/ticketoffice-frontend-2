import { ConfigService } from './ConfigService';

export interface CheckoutSessionResponse {
  sessionId: string;
  expiredIn: number;
}

export interface SessionInfoResponse {
  sessionId: string;
  eventId: string;
  priceId: string;
  quantity: number;
}

export class CheckoutService {
  private static BASE_URL = 'http://localhost:8080';

  /**
   * Creates a new checkout session for ticket purchase
   * @param eventId The ID of the event
   * @param ticketId The ID of the ticket to purchase
   * @param quantity Number of tickets to purchase
   * @returns Promise with the checkout session details
   */
  static async createSession(
    eventId: string,
    ticketId: string,
    quantity: number
  ): Promise<CheckoutSessionResponse> {
    if (this.isMocked()) {
      return this.getMockSession();
    }

    try {
      const response = await fetch(`${this.BASE_URL}/api/public/v1/checkout/session`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventId,
          priceId: ticketId,
          quantity
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create checkout session: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  private static isMocked(): boolean {
    return ConfigService.isMockedEnabled();
  }

  /**
   * Retrieves session information by session ID
   * @param sessionId The ID of the session to retrieve
   * @returns Promise with the session details
   */
  static async getSession(sessionId: string): Promise<SessionInfoResponse> {
    if (this.isMocked()) {
      return this.getMockSessionInfo(sessionId);
    }

    try {
      const response = await fetch(`${this.BASE_URL}/api/public/v1/checkout/session/${sessionId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get session: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  }

  private static getMockSession(): Promise<CheckoutSessionResponse> {
    return Promise.resolve({
      sessionId: `mock-session-${Math.random().toString(36).substring(2, 15)}`,
      expiredIn: 10540
    });
  }

  private static getMockSessionInfo(sessionId: string): Promise<SessionInfoResponse> {
    return Promise.resolve({
      sessionId,
      eventId: `mock-event-${Math.random().toString(36).substring(2, 10)}`,
      priceId: `mock-price-${Math.random().toString(36).substring(2, 10)}`,
      quantity: Math.floor(Math.random() * 5) + 1
    });
  }
}
