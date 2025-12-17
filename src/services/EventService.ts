// src/services/EventService.ts
import type { SearchEvent, SearchEventParams, SearchEventResponse } from '@/types/search-event';
import type { EventDetail, EventForList, Ticket, Image, Location } from '@/types/Event';

type EventRecommendation = Pick<EventForList, 'id' | 'name' | 'date' | 'location'>;

import { ConfigService } from './ConfigService';
import { AuthService } from './AuthService';
import { http } from '@/lib/http';
import { logger } from '@/lib/logger';
import { EventDetailSchema, EventListResponseSchema, SearchEventResponseSchema } from './schemas/event';
import {
  mockGetEvents,
  mockSearchEvents,
  mockGetEventById,
  mockCreateEvent,
  mockUpdateEvent,
  mockDeleteEvent,
} from '@/mocks';

export interface EventListResponse {
  events: EventForList[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/* ========== helpers seguros (sin any) ========== */

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}
function isString(x: unknown): x is string {
  return typeof x === 'string';
}
function isNumber(x: unknown): x is number {
  return typeof x === 'number' && Number.isFinite(x);
}

function dateArrayToIso(d: unknown): string | undefined {
  if (Array.isArray(d) && d.length >= 3) {
    const [Y, M, D, H = 0, Min = 0] = d as unknown[];
    if ([Y, M, D, H, Min].every(isNumber)) {
      try {
        return new Date(Y as number, (M as number) - 1, D as number, H as number, Min as number).toISOString();
      } catch {
        return undefined;
      }
    }
  }
  if (isString(d)) return d;
  return undefined;
}

interface RawSearchEvent extends Omit<SearchEvent, 'date'> {
  date?: unknown;
}
interface RawSearchResponse {
  events?: unknown;
  hasEventsInYourCity?: unknown;
  totalPages?: unknown;
  currentPage?: unknown;
  pageSize?: unknown;
}

function normalizeSearchResponse(raw: unknown): SearchEventResponse {
  const safe = (isRecord(raw) ? raw : {}) as RawSearchResponse;
  const eventsRaw = Array.isArray(safe.events) ? (safe.events as unknown[]) : [];
  const events: SearchEvent[] = eventsRaw.map((e) => {
    const obj = isRecord(e) ? e : {};
    const id = isString(obj.id) ? obj.id : '';
    const name = isString(obj.name) ? obj.name : '';
    // date puede venir string o array
    const dateIso = dateArrayToIso(obj.date) ?? new Date().toISOString();
    const location = isString(obj.location) ? obj.location : '';
    const bannerUrl = isString(obj.bannerUrl) ? obj.bannerUrl : '';
    const price = isNumber(obj.price) ? obj.price : 0;
    const currency = isString(obj.currency) ? obj.currency : '';
    const status = isString(obj.status) ? (obj.status as SearchEvent['status']) : 'ACTIVE';
    const minAge = isNumber(obj.minAge) ? obj.minAge : undefined;

    return { id, name, date: dateIso, location, bannerUrl, price, currency, status, minAge };
  });

  const out: SearchEventResponse = {
    events,
    hasEventsInYourCity: Boolean(safe.hasEventsInYourCity),
    totalPages: Number(safe.totalPages ?? 0),
    currentPage: Number(safe.currentPage ?? 0),
    pageSize: Number(safe.pageSize ?? 9),
  };

  // Validación final (no rompe si falla; sólo loggea)
  try {
    SearchEventResponseSchema.parse(out);
  } catch (zerr) {
    logger.warn('normalizeSearchResponse schema mismatch (continuing)', zerr);
  }
  return out;
}

type RawOrganizer = { id?: unknown; name?: unknown; url?: unknown; logo?: unknown; logoUrl?: unknown };
function normalizeOrganizer(org: unknown) {
  if (!isRecord(org)) return null;
  const o = org as RawOrganizer;
  const id = isString(o.id) ? o.id : '';
  const name = isString(o.name) ? o.name : '';
  const url = isString(o.url) ? o.url : '';
  const logoUrl = isString(o.logo) ? o.logo : isString(o.logoUrl) ? o.logoUrl : undefined;
  return { id, name, url, logoUrl };
}

function normalizeImage(img: unknown): Image {
  if (!isRecord(img)) return { url: '', alt: '' };
  const url = isString(img.url) ? img.url : '';
  const alt = isString(img.alt) ? img.alt : '';
  return { url, alt };
}

function normalizeLocation(loc: unknown): Location {
  if (!isRecord(loc)) return { name: '', address: '', city: '', country: '' };
  const name = isString(loc.name) ? loc.name : '';
  const address = isString(loc.address) ? loc.address : '';
  const city = isString(loc.city) ? loc.city : '';
  const country = isString(loc.country) ? loc.country : '';
  return { name, address, city, country };
}

function normalizeTickets(arr: unknown): Ticket[] {
  if (!Array.isArray(arr)) return [];
  const out: Ticket[] = [];
  for (const t of arr) {
    if (!isRecord(t)) continue;
    const id = isString(t.id) ? t.id : '';
    const value = isNumber(t.value) ? t.value : 0;
    const currency = isString(t.currency) ? t.currency : ''; // puede venir "$" y lo soportamos
    const type = isString(t.type) ? t.type : '';
    const isFree = typeof t.isFree === 'boolean' ? t.isFree : false;
    const stock = isNumber(t.stock) ? Math.max(0, Math.floor(t.stock)) : 0;
    out.push({ id, value, currency, type, isFree, stock });
  }
  return out;
}

function buildQuery<T extends Record<string, string | number | boolean | undefined | null>>(params: T): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    sp.set(k, String(v));
  }
  return sp.toString();
}

/* ========== servicio ========== */

export class EventService {
  private static BASE_URL = ConfigService.getApiBase();

  private static isMocked(): boolean {
    return ConfigService.isMockedEnabled();
  }

  static async search(params: SearchEventParams): Promise<SearchEventResponse> {
    return this.searchEvents(params);
  }

  static async searchEvents(params: SearchEventParams): Promise<SearchEventResponse> {
    // MOCK
    if (this.isMocked()) {
      const p: SearchEventParams = {
        ...params,
        pageNumber: Math.max(1, Number(params.pageNumber ?? 0)), // mocks 1-based
      };
      if (params.country === 'all' || params.country === 'Todos') {
        return mockSearchEvents({ ...p, country: 'all' });
      }
      return mockSearchEvents(p);
    }

    // BE real
    const country = (params.country || '').trim();
    if (!country || country.toLowerCase() === 'all') {
      return {
        events: [],
        currentPage: 0,
        pageSize: params.pageSize ?? 9,
        totalPages: 0,
        hasEventsInYourCity: false,
      };
    }

    const queryParams: Record<string, string | number | boolean | null | undefined> = {
      ...params,
      pageNumber: Math.max(0, Number(params.pageNumber ?? 0)), // 0-based
    };

    const qs = buildQuery(queryParams);
    const url = `${this.BASE_URL}/api/public/v1/event/search?${qs}`;
    const raw = await http.get<unknown>(url, { retries: 1 });

    const normalized = normalizeSearchResponse(raw);
    logger.debug('searchEvents parsed', {
      count: normalized.events.length,
      page: normalized.currentPage,
      pageSize: normalized.pageSize,
    });
    return normalized;
  }

  static async getPublicById(id: string): Promise<EventDetail> {
    if (this.isMocked()) {
      return mockGetEventById(id);
    }

    const raw = await http.get<unknown>(`${this.BASE_URL}/api/public/v1/event/${encodeURIComponent(id)}`, { retries: 1 });

    // Normaliza a un objeto que cumpla con el esquema
    const prepared: Record<string, unknown> = isRecord(raw) ? { ...raw } : {};
    prepared.date = dateArrayToIso(prepared.date) ?? new Date().toISOString();
    prepared.organizer = normalizeOrganizer(prepared.organizer);
    prepared.image = normalizeImage(prepared.image);
    prepared.location = normalizeLocation(prepared.location);
    prepared.tickets = normalizeTickets(prepared.tickets);

    // Validación final con Zod (ahora ya no debería fallar)
    const parsed = EventDetailSchema.parse(prepared);
    logger.debug('getPublicById parsed', { id: parsed.id });
    return parsed;
  }

  static async getRecommendations(id: string): Promise<EventRecommendation[]> {
    if (this.isMocked()) {
      return [];
    }
    return http.get<EventRecommendation[]>(
      `${this.BASE_URL}/api/public/v1/event/${encodeURIComponent(id)}/recommendations`,
      { retries: 1 }
    );
  }

  // Backoffice
  static async getEvents(page: number = 1, pageSize: number = 10): Promise<EventListResponse> {
    if (this.isMocked()) {
      return mockGetEvents(page, pageSize);
    }
    const currentUser = AuthService.getCurrentUser();
    const sellerScope = AuthService.isSeller() && currentUser ? `&sellerId=${encodeURIComponent(String(currentUser.id))}` : '';
    const raw = await http.get<unknown>(
      `${this.BASE_URL}/api/v1/events?page=${page}&pageSize=${pageSize}${sellerScope}`,
      { headers: { ...AuthService.getAuthHeader() }, retries: 1 }
    );
    const parsed = EventListResponseSchema.parse(raw);
    logger.debug('getEvents parsed', { page, pageSize, total: parsed.total });
    return parsed;
  }

  static async getEventById(id: string): Promise<EventDetail> {
    if (this.isMocked()) {
      return mockGetEventById(id);
    }
    const raw = await http.get<unknown>(`${this.BASE_URL}/api/v1/events/${id}`, {
      headers: { ...AuthService.getAuthHeader() },
      retries: 1,
    });

    // Normalizar respuesta antes de parsear (igual que getPublicById)
    const prepared: Record<string, unknown> = isRecord(raw) ? { ...raw } : {};
    prepared.date = dateArrayToIso(prepared.date) ?? new Date().toISOString();
    prepared.organizer = normalizeOrganizer(prepared.organizer);
    prepared.image = normalizeImage(prepared.image);
    prepared.location = normalizeLocation(prepared.location);
    prepared.tickets = normalizeTickets(prepared.tickets);

    const parsed = EventDetailSchema.parse(prepared);
    logger.debug('getEventById parsed', { id: parsed.id });
    return parsed;
  }
  static async createEvent(event: Omit<EventDetail, 'id'>): Promise<EventDetail> {
    if (this.isMocked()) {
      return mockCreateEvent(event as EventDetail);
    }
    const payload = {
      title: event.title,
      date: event.date,
      location: event.location,
      image: event.image,
      tickets: event.tickets,
      description: event.description,
      additionalInfo: event.additionalInfo,
    };
    const raw = await http.post<unknown>(`${this.BASE_URL}/api/v1/events`, payload, {
      headers: { ...AuthService.getAuthHeader() },
      retries: 0,
    });
    const parsed = EventDetailSchema.parse(raw);
    logger.info('createEvent success', { id: parsed.id });
    return parsed;
  }

  static async updateEvent(id: string, event: Partial<EventDetail>): Promise<EventDetail> {
    if (this.isMocked()) {
      return mockUpdateEvent(id, event);
    }
    const payload: Partial<Pick<EventDetail, 'title' | 'date' | 'location' | 'image' | 'tickets' | 'description' | 'additionalInfo'>> = {};
    if (event.title !== undefined) payload.title = event.title;
    if (event.date !== undefined) payload.date = event.date;
    if (event.location !== undefined) payload.location = event.location;
    if (event.image !== undefined) payload.image = event.image;
    if (event.tickets !== undefined) payload.tickets = event.tickets;
    if (event.description !== undefined) payload.description = event.description;
    if (event.additionalInfo !== undefined) payload.additionalInfo = event.additionalInfo;

    const raw = await http.put<unknown>(`${this.BASE_URL}/api/v1/events/${id}`, payload, {
      headers: { ...AuthService.getAuthHeader() },
      retries: 0,
    });
    const parsed = EventDetailSchema.parse(raw);
    logger.info('updateEvent success', { id: parsed.id });
    return parsed;
  }

  static async deleteEvent(id: string): Promise<void> {
    if (this.isMocked()) {
      return mockDeleteEvent(id);
    }
    await http.delete<void>(`${this.BASE_URL}/api/v1/events/${id}`, {
      headers: { ...AuthService.getAuthHeader() },
      retries: 0,
    });
    logger.warn('deleteEvent', { id });
  }
}
