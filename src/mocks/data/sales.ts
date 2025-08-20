import { Sale, SalesResponse } from '@/types/Sales';

const sales: Sale[] = [
  { id: '1', firstName: 'Juan', lastName: 'Pérez', email: 'juan@example.com', ticketType: 'General', price: 5000, validated: true },
  { id: '2', firstName: 'María', lastName: 'García', email: 'maria@example.com', ticketType: 'VIP', price: 10000, validated: false },
  { id: '3', firstName: 'Carlos', lastName: 'López', email: 'carlos@example.com', ticketType: 'General', price: 5000, validated: true },
];

export async function mockGetSaleById(eventId: string, saleId: string): Promise<Sale> {
  await new Promise((r) => setTimeout(r, 300));
  const s = sales.find((x) => x.id === saleId);
  if (!s) throw new Error('Sale not found');
  return s;
}

export async function mockGetEventSales(eventId: string): Promise<SalesResponse> {
  await new Promise((r) => setTimeout(r, 300));
  return { sales: [...sales] };
}