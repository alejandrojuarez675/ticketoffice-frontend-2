import { ConfigService } from './ConfigService';
import { 
  CheckoutSessionResponse, 
  SessionDataRequest, 
  SessionInfoResponse 
} from '@/types/checkout';

export class CheckoutService {
  private static BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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

  /**
   * Adds or updates data for a specific session
   * @param sessionId The ID of the session to update
   * @param data The data to add to the session
   * @returns Promise with the updated session details
   */
  static async addSessionData(
    sessionId: string, 
    data: SessionDataRequest
  ): Promise<SessionInfoResponse> {
    if (this.isMocked()) {
      return this.getMockSessionInfoWithData(sessionId, data);
    }

    try {
      const response = await fetch(`${this.BASE_URL}/api/public/v1/checkout/session/${sessionId}/data`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to update session data: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error updating session data:', error);
      throw error;
    }
  }

  /**
   * Processes the payment for a session
   * @param sessionId The ID of the session to process payment for
   * @returns Promise with the payment processing result
   */
  static async processPayment(sessionId: string): Promise<{ success: boolean; redirectUrl?: string }> {
    if (this.isMocked()) {
      return Promise.resolve({
        success: true,
        redirectUrl: `/congrats?sessionId=${sessionId}`
      });
    }

    try {
      const response = await fetch(`${this.BASE_URL}/api/public/v1/checkout/process-payment`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId })
      });

      if (!response.ok) {
        throw new Error(`Failed to process payment: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // Mock data generators
  private static getMockSessionInfo(sessionId: string): Promise<SessionInfoResponse> {
    return Promise.resolve({
      sessionId,
      eventId: `event-${Math.random().toString(36).substring(2, 10)}`,
      priceId: `ticket-${Math.random().toString(36).substring(2, 10)}`,
      quantity: 1,
      mainEmail: 'test@example.com',
      buyer: [
        {
          name: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '1234567890',
          nationality: 'Argentina',
          documentType: 'DNI',
          document: '12345678'
        }
      ]
    });
  }

  private static getMockSessionInfoWithData(
    sessionId: string, 
    data: SessionDataRequest
  ): Promise<SessionInfoResponse> {
    return Promise.resolve({
      sessionId,
      eventId: `event-${Math.random().toString(36).substring(2, 10)}`,
      priceId: `ticket-${Math.random().toString(36).substring(2, 10)}`,
      quantity: 1,
      ...data
    });
  }
}
