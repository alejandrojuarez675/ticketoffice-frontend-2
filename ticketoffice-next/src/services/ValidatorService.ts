import { ConfigService } from './ConfigService';

export class ValidatorService {
  private static BASE_URL = 'http://localhost:8080';

  /**
   * Validates a ticket for a specific event
   * @param eventId The ID of the event
   * @param ticketId The ID of the ticket to validate
   * @returns Promise that resolves when validation is successful
   * @throws Error if validation fails or there's a network error
   */
  static async validateTicket(eventId: string, ticketId: string): Promise<void> {
    if (this.isMocked()) {
      // In mock mode, we just return success
      return;
    }

    try {
      const response = await fetch(`${this.BASE_URL}/api/v1/events/${eventId}/sales/${ticketId}/validate`, {
        method: 'POST',
        headers: {
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to validate ticket ${ticketId} for event ${eventId}: ${response.status}`);
      }

      if (response.status !== 204) {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error validating ticket:', error);
      throw error;
    }
  }

  private static isMocked(): boolean {
    return ConfigService.isMockedEnabled();
  }
}
