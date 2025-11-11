import { ConfigService } from './ConfigService';

export type ReportSale = {
  id: string;
  date: string;
  eventName: string;
  buyerEmail: string;
  ticketType: string;
  price: number;
};

export type ReportFilters = {
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
  scope?: 'all' | 'self';
};

export type ReportPage<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const mockSales: ReportSale[] = Array.from({ length: 47 }).map((_, i) => ({
  id: `s${i + 1}`,
  date: `2025-05-${String((i % 28) + 1).padStart(2, '0')}T19:30:00`,
  eventName: i % 3 === 0 ? 'Concierto en Vivo' : i % 3 === 1 ? 'Feria del Libro' : 'Vallenato Fest',
  buyerEmail: `comprador${i + 1}@mail.com`,
  ticketType: i % 2 === 0 ? 'General' : 'VIP',
  price: (i % 5 === 0 ? 3000 : 1500) + (i % 7) * 100,
}));

export const ReportService = {
  async listSales(filters: ReportFilters = {}): Promise<ReportPage<ReportSale>> {
    const { from, to, page = 1, pageSize = 10 } = filters;
    if (ConfigService.isMockedEnabled()) {
      await new Promise((r) => setTimeout(r, 250));
      let data = [...mockSales];
      if (from) data = data.filter((s) => new Date(s.date) >= new Date(from));
      if (to) data = data.filter((s) => new Date(s.date) <= new Date(to + 'T23:59:59'));

      const total = data.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const start = (page - 1) * pageSize;
      const items = data.slice(start, start + pageSize);
      return { items, total, page, pageSize, totalPages };
    }

    const base = ConfigService.getApiBase();
    const qs = new URLSearchParams({ ...filters, page: String(page), pageSize: String(pageSize) }).toString();
    const res = await fetch(`${base}/api/private/v1/reports/sales?${qs}`, { headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error('No se pudieron cargar los reportes');
    return res.json();
  },
};