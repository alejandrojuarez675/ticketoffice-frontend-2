import { AuthService } from './AuthService';
import { ConfigService } from './ConfigService';
import { http } from '@/lib/http';
import { logger } from '@/lib/logger';
import { SalesListResponseSchema } from './schemas/sales';

// Tipos locales previos – los mantengo para mock/CSV
export type SaleRecord = {
  id: string;
  date: string; // ISO
  eventId: string;
  eventName: string;
  sellerId: string;
  sellerName: string;
  buyerEmail: string;
  quantity: number;
  unitPrice: number;
  total: number;
  couponCode?: string;
  vendorCode?: string;
  paymentStatus: 'paid' | 'refunded' | 'failed' | 'pending';
  orderId: string;
};

export type SalesFilters = {
  from?: string;
  to?: string;
  eventId?: string;
  sellerId?: string;
  query?: string;
};

const mockSales: SaleRecord[] = [
  // ... (igual que lo tenías)
];

function applyFilters(data: SaleRecord[], f: SalesFilters): SaleRecord[] {
  let out = [...data];
  if (f.from) {
    const fromTs = new Date(f.from + 'T00:00:00Z').getTime();
    out = out.filter((r) => new Date(r.date).getTime() >= fromTs);
  }
  if (f.to) {
    const toTs = new Date(f.to + 'T23:59:59Z').getTime();
    out = out.filter((r) => new Date(r.date).getTime() <= toTs);
  }
  if (f.eventId) out = out.filter((r) => r.eventId === f.eventId);
  if (f.sellerId) out = out.filter((r) => r.sellerId === f.sellerId);
  if (f.query) {
    const q = f.query.toLowerCase();
    out = out.filter(
      (r) =>
        r.eventName.toLowerCase().includes(q) ||
        r.buyerEmail.toLowerCase().includes(q) ||
        (r.couponCode || '').toLowerCase().includes(q) ||
        (r.vendorCode || '').toLowerCase().includes(q) ||
        r.orderId.toLowerCase().includes(q)
    );
  }
  return out;
}

export const SalesService = {
  // Mock legacy (si no hay eventId y estamos en mock)
  async list(filters: SalesFilters = {}): Promise<SaleRecord[]> {
    const current = AuthService.getCurrentUser();
    const isSeller = AuthService.isSeller();
    const scoped: SalesFilters = {
      ...filters,
      sellerId: filters.sellerId ?? (isSeller && current ? String(current.id) : undefined),
    };

    if (ConfigService.isMockedEnabled()) {
      await new Promise((r) => setTimeout(r, 250));
      return applyFilters(mockSales, scoped);
    }

    // En real BE, no existe /api/v1/sales genérico en tu OpenAPI.
    // Para no romper, si no hay eventId devolvemos vacío.
    if (!scoped.eventId) {
      logger.warn('SalesService.list called without eventId on real API. Returning empty.');
      return [];
    }
    const real = await this.listByEvent(scoped.eventId);
    // Opcional: transformar a SaleRecord si tu UI lo requiere. Por MVP, devolvemos vacío para legacy.
    return [];
  },

  // MVP: lista por evento (OpenAPI: GET /api/v1/events/{id}/sales)
  async listByEvent(eventId: string) {
    const base = ConfigService.getApiBase();
    const response = await http.get<{ sales: unknown }>(
      `${base}/api/v1/events/${encodeURIComponent(eventId)}/sales`,
      { headers: { ...AuthService.getAuthHeader() }, retries: 1 }
    );
    const salesData = response.sales || [];
    const parsed = SalesListResponseSchema.parse(salesData);
    logger.debug('SalesService.listByEvent parsed', { count: parsed.length, eventId });
    return parsed; // SaleRecordDTO[]
  },

  // MVP: validar entrada (OpenAPI: POST /api/v1/events/{id}/sales/{saleId}/validate)
  async validate(eventId: string, saleId: string) {
    const base = ConfigService.getApiBase();
    await http.post<void, void>(
      `${base}/api/v1/events/${encodeURIComponent(eventId)}/sales/${encodeURIComponent(saleId)}/validate`,
      undefined,
      { headers: { ...AuthService.getAuthHeader() }, retries: 0 }
    );
    logger.info('SalesService.validate ok', { eventId, saleId });
  },

  toCSV(rows: SaleRecord[]): string {
    const headers = [
      'Fecha','Evento','Vendedor','Email comprador','Cantidad','Precio unitario','Total',
      'Cupón','Código vendedor','Estado pago','Orden',
    ];
    const escape = (v: unknown) => {
      const s = v == null ? '' : String(v);
      return `"${s.replace(/"/g, '""')}"`;
    };
    const lines = rows.map((r) =>
      [
        new Date(r.date).toISOString(),
        r.eventName,
        r.sellerName,
        r.buyerEmail,
        r.quantity,
        r.unitPrice.toFixed(2),
        r.total.toFixed(2),
        r.couponCode || '',
        r.vendorCode || '',
        r.paymentStatus,
        r.orderId,
      ].map(escape).join(',')
    );
    return [headers.map(escape).join(','), ...lines].join('\\n');
  },
};