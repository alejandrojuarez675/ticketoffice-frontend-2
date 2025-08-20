import { ConfigService } from './ConfigService';
import { AuthService } from './AuthService';

class ValidatorService {
  private static BASE_URL = ConfigService.getApiBase();

  static async validateTicket(eventId: string, ticketId: string): Promise<void> {
    if (this.isMocked()) return;

    try {
      const response = await fetch(`${this.BASE_URL}/api/v1/events/${eventId}/sales/${ticketId}/validate`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          ...AuthService.getAuthHeader(), // si el endpoint requiere auth
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

export { ValidatorService };
