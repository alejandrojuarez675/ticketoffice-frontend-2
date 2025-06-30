import { SalesServiceMock } from 'mocks/SalesServiceMock';
import { SalesResponse } from '../types/Sales';
import { ConfigService } from './ConfigService';

export class SalesService {
  private static BASE_URL = 'http://localhost:8080';

  static async getSalesByEventId(eventId: string): Promise<SalesResponse> {
    if (this.isMocked()) {
      return SalesServiceMock.getMockSales();
    }

    try {
      const response = await fetch(`${this.BASE_URL}/api/v1/events/${eventId}/sales`, {
        headers: {
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sales for event ${eventId}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw error;
    }
  }

  private static isMocked(): boolean {
    return ConfigService.isMockedEnabled();
  }
}
