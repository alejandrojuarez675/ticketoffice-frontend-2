import { Sale, SalesResponse } from '@/types/Sales';
import { ConfigService } from './ConfigService';

// Mock data for development
const mockSales: Sale[] = [
  {
    id: '1',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@example.com',
    ticketType: 'General',
    price: 5000,
    validated: true
  },
  {
    id: '2',
    firstName: 'María',
    lastName: 'García',
    email: 'maria@example.com',
    ticketType: 'VIP',
    price: 10000,
    validated: false
  },
  {
    id: '3',
    firstName: 'Carlos',
    lastName: 'López',
    email: 'carlos@example.com',
    ticketType: 'General',
    price: 5000,
    validated: true
  }
];

const mockSalesResponse = (): SalesResponse => {
  return {
    sales: [...mockSales]
  };
};

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
    if (ConfigService.isMockedEnabled()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const sale = mockSales.find(s => s.id === saleId);
      if (!sale) {
        throw new Error('Sale not found');
      }
      return sale;
    }

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
    if (ConfigService.isMockedEnabled()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockSalesResponse();
    }

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
