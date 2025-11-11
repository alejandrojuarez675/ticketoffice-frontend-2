// src/services/CouponService.ts
import { ConfigService } from './ConfigService';

export type Coupon = {
  id: string;
  eventId: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  maxUses?: number;
  used?: number;
  expiresAt?: string;
  active: boolean;
};

const mockCoupons: Coupon[] = [];

export const CouponService = {
  async listByEvent(eventId: string): Promise<Coupon[]> {
    if (ConfigService.isMockedEnabled()) {
      await new Promise((r) => setTimeout(r, 200));
      return mockCoupons.filter((c) => c.eventId === eventId);
    }
    const base = ConfigService.getApiBase();
    const res = await fetch(`${base}/api/private/v1/events/${eventId}/coupons`);
    if (!res.ok) throw new Error('No se pudieron cargar los cupones');
    return res.json();
  },

  async create(eventId: string, payload: Omit<Coupon, 'id' | 'eventId' | 'used' | 'active'>): Promise<Coupon> {
    if (ConfigService.isMockedEnabled()) {
      await new Promise((r) => setTimeout(r, 200));
      const c: Coupon = {
        id: Math.random().toString(36).slice(2, 10),
        eventId,
        code: payload.code,
        type: payload.type,
        value: payload.value,
        maxUses: payload.maxUses,
        expiresAt: payload.expiresAt,
        used: 0,
        active: true,
      };
      mockCoupons.push(c);
      return c;
    }
    const base = ConfigService.getApiBase();
    const res = await fetch(`${base}/api/private/v1/events/${eventId}/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('No se pudo crear el cupón');
    return res.json();
  },
};