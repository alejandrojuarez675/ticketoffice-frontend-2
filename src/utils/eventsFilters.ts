// src/utils/eventsFilters.ts
import type { SearchEvent } from '@/types/search-event';

export type SortKey = 'dateAsc' | 'dateDesc' | 'priceAsc' | 'priceDesc';
export type Filters = {
  country?: string;
  city?: string;
  category?: string;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
  savedOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  adultOnly?: boolean;
  vendors?: string[]; // vendor IDs
};

export function parseLocation(loc: string) {
  const parts = loc.split(',').map((s) => s.trim());
  if (parts.length >= 2) return { city: parts[0], country: parts[1] };
  return { city: parts[0] ?? '', country: '' };
}

export function deriveCategory(name: string) {
  const n = name.toLowerCase();
  if (n.includes('festival')) return 'Festival';
  if (n.includes('concierto')) return 'Concierto';
  if (n.includes('teatro') || n.includes('obra')) return 'Teatro';
  if (n.includes('feria')) return 'Feria';
  if (n.includes('discoteca') || n.includes('club')) return 'Discoteca';
  return 'Otros';
}

export function buildFacets(events: SearchEvent[]) {
  const countries = new Set<string>();
  const citiesByCountry = new Map<string, Set<string>>();
  const categories = new Set<string>();

  for (const e of events) {
    const { city, country } = parseLocation(e.location);
    if (country) {
      countries.add(country);
      if (!citiesByCountry.has(country)) citiesByCountry.set(country, new Set());
      if (city) citiesByCountry.get(country)!.add(city);
    }
    categories.add(deriveCategory(e.name));
  }

  const citiesFlat = new Set<string>();
  for (const set of citiesByCountry.values()) for (const c of set) citiesFlat.add(c);

  return {
    countries: Array.from(countries).sort(),
    cities: Array.from(citiesFlat).sort(),
    categories: Array.from(categories).sort(),
    citiesByCountry: Array.from(citiesByCountry.entries()).reduce<Record<string, string[]>>(
      (acc, [k, v]) => ((acc[k] = Array.from(v).sort()), acc),
      {}
    ),
  };
}

export function applyFilters(list: SearchEvent[], filters: Filters, favoriteIds?: Set<string>) {
  const fromTime = filters.dateFrom ? Date.parse(filters.dateFrom) : undefined;
  const toTimeExclusive = filters.dateTo ? Date.parse(filters.dateTo) + 24 * 60 * 60 * 1000 - 1 : undefined;

  return list.filter((e) => {
    // No mostrar inactivos
    if (e.status === 'INACTIVE') return false;

    if (filters.savedOnly && favoriteIds && !favoriteIds.has(e.id)) return false;

    if (filters.minPrice !== undefined && e.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && e.price > filters.maxPrice) return false;

    if (filters.adultOnly && !(e.minAge !== undefined && e.minAge >= 18)) return false;

    // Vendors (seller) filter: accept if event vendorId is in selected list.
    if (filters.vendors && filters.vendors.length > 0) {
      const vid = e.vendorId ?? '';
      const vname = (e.vendorName ?? '').toLowerCase();
      const hasVendor = filters.vendors.some((v) => v === vid || v.toLowerCase() === vname);
      if (!hasVendor) return false;
    }

    const { city, country } = parseLocation(e.location);
    if (filters.country && country !== filters.country) return false;
    if (filters.city && city !== filters.city) return false;

    const category = deriveCategory(e.name);
    if (filters.category && category !== filters.category) return false;

    const t = Date.parse(e.date);
    if (fromTime !== undefined && t < fromTime) return false;
    if (toTimeExclusive !== undefined && t > toTimeExclusive) return false;

    return true;
  });
}

export function sortEvents(list: SearchEvent[], sort: SortKey) {
  const arr = [...list];
  switch (sort) {
    case 'dateAsc':
      return arr.sort((a, b) => Number(new Date(a.date)) - Number(new Date(b.date)));
    case 'dateDesc':
      return arr.sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)));
    case 'priceAsc':
      return arr.sort((a, b) => a.price - b.price);
    case 'priceDesc':
      return arr.sort((a, b) => b.price - a.price);
    default:
      return arr;
  }
}

export function paginate<T>(list: T[], page: number, pageSize: number) {
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  return {
    slice: list.slice(start, end),
    total,
    totalPages,
    page: safePage,
    pageSize,
  };
}