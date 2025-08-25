// src/services/StatsService.ts
import { ConfigService } from './ConfigService';

export type SellerSummary = {
  totalEvents: number;
  ticketsSold: number;
  totalRevenue: number;
};

export type GlobalSummary = {
  totalEvents: number;
  ticketsSold: number;
  totalRevenue: number;
};

export const StatsService = {
  async getSellerSummary(sellerId: string): Promise<SellerSummary> {
    if (ConfigService.isMockedEnabled()) {
      await new Promise((r) => setTimeout(r, 300));
      return { totalEvents: 8, ticketsSold: 420, totalRevenue: 325000 };
    }
    const base = ConfigService.getApiBase();
    const res = await fetch(`${base}/api/private/v1/stats/seller/${sellerId}`, { headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error('No se pudo cargar el resumen del vendedor');
    return res.json();
  },

  async getGlobalSummary(): Promise<GlobalSummary> {
    if (ConfigService.isMockedEnabled()) {
      await new Promise((r) => setTimeout(r, 300));
      return { totalEvents: 120, ticketsSold: 18250, totalRevenue: 9825000 };
    }
    const base = ConfigService.getApiBase();
    const res = await fetch(`${base}/api/private/v1/stats/global`, { headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error('No se pudo cargar el resumen global');
    return res.json();
  },
};