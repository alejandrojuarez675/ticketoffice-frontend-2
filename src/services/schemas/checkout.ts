import { z } from 'zod';

export const BuyerDataSchema = z.object({
  name: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  nationality: z.string().min(1),
  documentType: z.string().min(1),
  document: z.string().min(1),
});

export const SessionDataRequestSchema = z.object({
  mainEmail: z.string().email(),
  buyer: z.array(BuyerDataSchema).min(1),
  couponCode: z.string().trim().optional(),
});

export const CheckoutSessionResponseSchema = z.object({
  sessionId: z.string().min(1),
  expiredIn: z.number().int().nonnegative(),
});

export const SessionInfoResponseSchema = z.object({
  sessionId: z.string().min(1),
  eventId: z.string().min(1),
  priceId: z.string().min(1),
  quantity: z.number().int().positive(),
  mainEmail: z.string().email().optional(),
  buyer: z.array(BuyerDataSchema).optional(),
});

export const ProcessPaymentResponseSchema = z.object({
  success: z.boolean(),
  redirectUrl: z.string().url().optional(),
  error: z.string().optional(),
});

export type BuyerDataDTO = z.infer<typeof BuyerDataSchema>;
export type SessionDataRequestDTO = z.infer<typeof SessionDataRequestSchema>;
export type CheckoutSessionResponseDTO = z.infer<typeof CheckoutSessionResponseSchema>;
export type SessionInfoResponseDTO = z.infer<typeof SessionInfoResponseSchema>;
export type ProcessPaymentResponseDTO = z.infer<typeof ProcessPaymentResponseSchema>;
