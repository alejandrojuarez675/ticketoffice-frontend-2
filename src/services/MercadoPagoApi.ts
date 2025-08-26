/**
 * MercadoPagoApi
 *
 * Frontend wrapper to initiate a MercadoPago checkout via the backend and redirect the user.
 *
 * How it works end-to-end:
 * 1) Frontend collects buyer data and saves it to the checkout session.
 * 2) Frontend calls backend endpoint to create a MercadoPago preference for that session.
 * 3) Backend returns a redirect URL (init_point or sandbox_init_point).
 * 4) Frontend navigates to that URL.
 * 5) After payment, MercadoPago redirects to back_urls (success/failure/pending) on the frontend.
 * 6) Separately, MercadoPago calls backend webhook. Backend validates payment and issues tickets.
 * 7) Frontend "congrats" page loads tickets via TicketService using the same sessionId.
 *
 * Backend responsibilities (expected):
 * - POST /api/public/v1/checkout/process-payment { sessionId }
 *   - Creates MP preference with back_urls:
 *     success: https://<frontend-domain>/checkout/congrats?sessionId=<SESSION_ID>
 *     failure: https://<frontend-domain>/checkout/<SESSION_ID>?status=failure
 *     pending: https://<frontend-domain>/checkout/<SESSION_ID>?status=pending
 *   - Sets auto_return to "approved".
 *   - Returns { success: true, redirectUrl }.
 * - POST /api/public/v1/webhooks/mercadopago
 *   - Validates payment data and issues tickets.
 *
 * Usage from UI:
 *   await MercadoPagoApi.createCheckoutRedirect(sessionId) // returns URL
 *   router.push(url)
 */

import { CheckoutService } from './CheckoutService';
import type { ProcessPaymentResponse } from '@/types/checkout';

export class MercadoPagoApi {
  /**
   * Requests the backend to create a MercadoPago preference and returns the redirect URL.
   * Internally delegates to CheckoutService.processPayment to avoid duplication.
   */
  static async createCheckoutRedirect(sessionId: string): Promise<string> {
    const res: ProcessPaymentResponse = await CheckoutService.processPayment(sessionId);
    if (!res.success || !res.redirectUrl) {
      throw new Error(res.error || 'No se pudo crear la preferencia de pago');
    }
    return res.redirectUrl;
  }
}
