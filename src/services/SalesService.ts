// src/services/SalesService.ts
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
  vendorCode?: string; // código de vendedor/subvendedor
  paymentStatus: 'paid' | 'refunded' | 'failed' | 'pending';
  orderId: string;
};

export type SalesFilters = {
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  eventId?: string;
  sellerId?: string;
  query?: string; // busca en eventName, buyerEmail, couponCode, vendorCode, orderId
};

const mockSales: SaleRecord[] = [
  {
    id: 's1',
    date: new Date().toISOString(),
    eventId: 'e1',
    eventName: 'Concierto Central',
    sellerId: 'v1',
    sellerName: 'Vendedor Uno',
    buyerEmail: 'buyer1@example.com',
    quantity: 2,
    unitPrice: 25,
    total: 50,
    couponCode: 'PROMO10',
    vendorCode: 'VEN-ALFA',
    paymentStatus: 'paid',
    orderId: 'ORD-1001',
  },
  {
    id: 's2',
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    eventId: 'e2',
    eventName: 'Festival Playa',
    sellerId: 'v2',
    sellerName: 'Vendedor Dos',
    buyerEmail: 'buyer2@example.com',
    quantity: 1,
    unitPrice: 40,
    total: 40,
    paymentStatus: 'paid',
    orderId: 'ORD-1002',
  },
  {
    id: 's3',
    date: new Date(Date.now() - 86400000 * 7).toISOString(),
    eventId: 'e1',
    eventName: 'Concierto Central',
    sellerId: 'v1',
    sellerName: 'Vendedor Uno',
    buyerEmail: 'buyer3@example.com',
    quantity: 3,
    unitPrice: 25,
    total: 75,
    vendorCode: 'VEN-BETA',
    paymentStatus: 'refunded',
    orderId: 'ORD-1003',
  },
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
  // Por ahora mock. Luego sustituir por fetch a tu BE con estos mismos filtros.
  async list(filters: SalesFilters = {}): Promise<SaleRecord[]> {
    await new Promise((r) => setTimeout(r, 250));
    return applyFilters(mockSales, filters);
  },

  toCSV(rows: SaleRecord[]): string {
    const headers = [
      'Fecha',
      'Evento',
      'Vendedor',
      'Email comprador',
      'Cantidad',
      'Precio unitario',
      'Total',
      'Cupón',
      'Código vendedor',
      'Estado pago',
      'Orden',
    ];
    const escape = (v: unknown) => {
      const s = v == null ? '' : String(v);
      // Quote and escape double quotes
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
      ]
        .map(escape)
        .join(',')
    );
    return [headers.map(escape).join(','), ...lines].join('\n');
  },
};