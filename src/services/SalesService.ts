import { Sale, SalesResponse } from '@/types/Sales';
import { ConfigService } from './ConfigService';
import { AuthService } from './AuthService';
import { mockGetSaleById, mockGetEventSales } from '@/mocks';

export class SalesService {
  private static instance: SalesService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = `${ConfigService.getApiBase()}/api/sales`;
  }

  public static getInstance(): SalesService {
    if (!SalesService.instance) SalesService.instance = new SalesService();
    return SalesService.instance;
  }

  public async getSaleById(eventId: string, saleId: string): Promise<Sale> {
    if (ConfigService.isMockedEnabled()) {
      return mockGetSaleById(eventId, saleId);
    }

    const response = await fetch(`${this.baseUrl}/${eventId}/${saleId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...AuthService.getAuthHeader() },
    });
    if (!response.ok) throw new Error('Error fetching sale');
    return response.json();
  }

  public async getEventSales(eventId: string): Promise<SalesResponse> {
    if (ConfigService.isMockedEnabled()) {
      return mockGetEventSales(eventId);
    }

    const response = await fetch(`${this.baseUrl}/event/${eventId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...AuthService.getAuthHeader() },
    });
    if (!response.ok) throw new Error('Error fetching event sales');
    return response.json();
  }
}