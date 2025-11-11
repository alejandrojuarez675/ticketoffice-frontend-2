// src/services/schemas/sales.ts
import { z } from 'zod';

// BE: sale "liviana" para listados y validación
export const SaleLightSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  ticketType: z.string(),
  price: z.number(),
  validated: z.boolean(),
});

// Respuesta del endpoint GET /api/v1/events/{id}/sales
export const SalesListResponseSchema = z.object({
  sales: z.array(SaleLightSchema),
});

export type SaleLightDTO = z.infer<typeof SaleLightSchema>;
export type SalesListResponseDTO = z.infer<typeof SalesListResponseSchema>;

// (Opcional) Antiguo schema de "registro" si alguna UI lo requiere todavía
export const SaleRecordSchema = z.object({
  id: z.string(),
  date: z.string(),
  eventId: z.string(),
  eventName: z.string(),
  sellerId: z.string(),
  sellerName: z.string(),
  buyerEmail: z.string().email(),
  quantity: z.number().int().nonnegative(),
  unitPrice: z.number(),
  total: z.number(),
  couponCode: z.string().optional(),
  vendorCode: z.string().optional(),
  paymentStatus: z.enum(['paid', 'refunded', 'failed', 'pending']),
  orderId: z.string(),
});
export type SaleRecordDTO = z.infer<typeof SaleRecordSchema>;
