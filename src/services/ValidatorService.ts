// src/services/ValidatorService.ts
import { ConfigService } from './ConfigService';
import { AuthService } from './AuthService';
import { http } from '@/lib/http';

class ValidatorService {
  private static BASE_URL = ConfigService.getApiBase();

  static async validateTicket(eventId: string, ticketId: string): Promise<void> {
    if (ConfigService.isMockedEnabled()) return;
    await http.post<void, void>(
      `${this.BASE_URL}/api/v1/events/${encodeURIComponent(eventId)}/sales/${encodeURIComponent(ticketId)}/validate`,
      undefined,
      { headers: { ...AuthService.getAuthHeader() }, retries: 0 }
    );
  }
}

export { ValidatorService };
