import { z } from 'zod';

export const SaleRecordSchema = z.object({
  id: z.string(),
  date: z.string(), // ISO
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

export const SalesListResponseSchema = z.array(SaleRecordSchema);

export type SaleRecordDTO = z.infer<typeof SaleRecordSchema>;
