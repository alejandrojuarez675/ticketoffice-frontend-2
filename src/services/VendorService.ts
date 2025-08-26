import { ConfigService } from './ConfigService';

export type Vendor = {
  id: string;
  name: string;
  email: string;
  role: 'seller';
  status: 'active' | 'invited' | 'disabled';
  events: number;
  createdAt: string;
};

const mockVendors: Vendor[] = [
  { id: 'v1', name: 'Vendedor Uno', email: 'seller1@example.com', role: 'seller', status: 'active', events: 8, createdAt: '2025-01-01' },
  { id: 'v2', name: 'Vendedor Dos', email: 'seller2@example.com', role: 'seller', status: 'invited', events: 0, createdAt: '2025-02-10' },
];

export const VendorService = {
  async list(): Promise<Vendor[]> {
    if (ConfigService.isMockedEnabled()) {
      await new Promise((r) => setTimeout(r, 300));
      return [...mockVendors];
    }
    const base = ConfigService.getApiBase();
    const res = await fetch(`${base}/api/private/v1/vendors`);
    if (!res.ok) throw new Error('No se pudo cargar vendedores');
    return res.json();
  },

  async invite(name: string, email: string): Promise<Vendor> {
    if (ConfigService.isMockedEnabled()) {
      await new Promise((r) => setTimeout(r, 300));
      const v: Vendor = {
        id: Math.random().toString(36).slice(2, 10),
        name,
        email,
        role: 'seller',
        status: 'invited',
        events: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      mockVendors.unshift(v);
      return v;
    }
    const base = ConfigService.getApiBase();
    const res = await fetch(`${base}/api/private/v1/vendors/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    if (!res.ok) throw new Error('No se pudo invitar al vendedor');
    return res.json();
  },

  async setActive(id: string, active: boolean): Promise<void> {
    if (ConfigService.isMockedEnabled()) {
      await new Promise((r) => setTimeout(r, 200));
      const idx = mockVendors.findIndex((v) => v.id === id);
      if (idx >= 0) mockVendors[idx].status = active ? 'active' : 'disabled';
      return;
    }
    const base = ConfigService.getApiBase();
    const res = await fetch(`${base}/api/private/v1/vendors/${id}/${active ? 'activate' : 'disable'}`, { method: 'POST' });
    if (!res.ok) throw new Error('No se pudo actualizar el estado');
  },
};
