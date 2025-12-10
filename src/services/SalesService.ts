// src/services/SalesService.ts
import { AuthService } from './AuthService';
import { ConfigService } from './ConfigService';
import { http } from '@/lib/http';
import { logger } from '@/lib/logger';
import { SalesListResponseSchema } from './schemas/sales';

// Tipos locales sólo para CSV/mock
export type SaleRecord = {
  id: string;
  date: string;
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

// mockSales omitido por brevedad

export const SalesService = {
  // Mock legacy
  async list(_filters: SalesFilters = {}): Promise<SaleRecord[]> {
    if (ConfigService.isMockedEnabled()) {
      return []; // si necesitas mock real, reusa el array omitido arriba
    }
    // En BE real no existe endpoint global; evita romper
    return [];
  },

  // MVP: lista por evento (GET /api/v1/events/{id}/sales)
  async listByEvent(eventId: string) {
    const base = ConfigService.getApiBase();
    const raw = await http.get<unknown>(
      `${base}/api/v1/events/${encodeURIComponent(eventId)}/sales`,
      { headers: { ...AuthService.getAuthHeader() }, retries: 1 }
    );
    const parsed = SalesListResponseSchema.parse(raw); // -> { sales: [...] }
    logger.debug('SalesService.listByEvent parsed', { count: parsed.sales.length, eventId });
    return parsed;
  },

  /**
   * [F1-006] MVP: Validar entrada de un evento
   * 
   * IMPORTANTE: Este es el ÚNICO método para validar entradas.
   * ValidatorService.ts fue eliminado para evitar duplicación.
   * 
   * Endpoint BE: POST /api/public/v1/checkout/session/{sessionId}/validate
   * Requiere: Autenticación (seller)
   * Response: 204 No Content si exitoso
   * 
   * NOTA: El sessionId es el ID de la sesión de checkout (viene en el QR del ticket)
   * 
   * @param sessionId - ID de la sesión de checkout a validar
   * @throws HttpError si la validación falla (404, 400, etc.)
   */
  async validate(sessionId: string): Promise<void> {
    const base = ConfigService.getApiBase();
    await http.post<void, void>(
      `${base}/api/public/v1/checkout/session/${encodeURIComponent(sessionId)}/validate`,
      undefined,
      { headers: { ...AuthService.getAuthHeader() }, retries: 0 }
    );
    logger.info('SalesService.validate ok', { sessionId });
  },

  toCSV(rows: SaleRecord[]): string {
    const headers = [
      'Fecha','Evento','Vendedor','Email comprador','Cantidad','Precio unitario','Total',
      'Cupón','Código vendedor','Estado pago','Orden',
    ];
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
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
