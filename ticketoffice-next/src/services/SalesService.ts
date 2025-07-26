import { Sale, SalesResponse } from '@/types/sales';

export class SalesService {
  private static instance: SalesService;
  private baseUrl: string;

  private constructor() {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    this.baseUrl = `${BASE_URL}/api/sales`;
  }

  public static getInstance(): SalesService {
    if (!SalesService.instance) {
      SalesService.instance = new SalesService();
    }
    return SalesService.instance;
  }

  public async getSaleById(eventId: string, saleId: string): Promise<Sale> {
    try {
      const response = await fetch(`${this.baseUrl}/${eventId}/${saleId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error fetching sale');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in getSaleById:', error);
      throw error;
    }
  }

  public async getEventSales(eventId: string): Promise<SalesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/event/${eventId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error fetching event sales');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in getEventSales:', error);
      throw error;
    }
  }
}
