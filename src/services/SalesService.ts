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
   * Endpoint BE: POST /api/v1/events/{eventId}/sales/{saleId}/validate
   * Requiere: Autenticación (seller/admin)
   * Response: 204 No Content si exitoso
   * 
   * @param eventId - ID del evento
   * @param saleId - ID de la venta a validar
   * @throws HttpError si la validación falla (404, 400, etc.)
   */
  async validateSale(eventId: string, saleId: string): Promise<void> {
    const base = ConfigService.getApiBase();
    await http.post<void, void>(
      `${base}/api/v1/events/${encodeURIComponent(eventId)}/sales/${encodeURIComponent(saleId)}/validate`,
      undefined,
      { headers: { ...AuthService.getAuthHeader() }, retries: 0 }
    );
    logger.info('SalesService.validateSale ok', { eventId, saleId });
  },

  /**
   * Valida una entrada usando solo el saleId
   * Si el QR contiene el formato eventId/saleId o eventId__saleId, lo parsea
   * De lo contrario, intenta validar directamente (útil para MVP)
   */
  async validate(saleId: string): Promise<void> {
    if (ConfigService.isMockedEnabled()) {
      // Mock: simular validación exitosa
      await new Promise((resolve) => setTimeout(resolve, 500));
      logger.info('SalesService.validate mock ok', { saleId });
      return;
    }

    // Intentar parsear si el saleId contiene eventId
    // Formatos soportados: "eventId/saleId", "eventId__saleId"
    let eventId = '';
    let actualSaleId = saleId;

    if (saleId.includes('/')) {
      const parts = saleId.split('/');
      eventId = parts[0];
      actualSaleId = parts[1] || saleId;
    } else if (saleId.includes('__')) {
      const parts = saleId.split('__');
      eventId = parts[0];
      actualSaleId = parts[1] || saleId;
    }

    // Si tenemos eventId, usar el endpoint específico
    if (eventId) {
      await this.validateSale(eventId, actualSaleId);
      return;
    }

    // Si no, intentar validar directamente
    // Nota: Esto puede fallar si el backend requiere eventId
    // En ese caso, el frontend debe obtener el eventId primero
    const base = ConfigService.getApiBase();
    try {
      // Intentar con el endpoint más general si existe
      await http.post<void, void>(
        `${base}/api/v1/sales/${encodeURIComponent(actualSaleId)}/validate`,
        undefined,
        { headers: { ...AuthService.getAuthHeader() }, retries: 0 }
      );
      logger.info('SalesService.validate ok', { saleId: actualSaleId });
    } catch (error) {
      logger.error('SalesService.validate failed', { saleId: actualSaleId, error });
      throw error;
    }
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
