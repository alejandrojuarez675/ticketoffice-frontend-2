import type { SearchEventParams, SearchEventResponse } from '@/types/search-event';
import type { EventDetail, EventForList } from '@/types/Event';

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

export class EventService {
  private static BASE_URL = ConfigService.getApiBase();

  private static isMocked(): boolean {
    return ConfigService.isMockedEnabled();
  }

  // Public endpoints (MVP)
  static async search(params: SearchEventParams): Promise<SearchEventResponse> {
    // alias para compatibilidad con los componentes del MVP
    return this.searchEvents(params);
  }

  static async searchEvents(params: SearchEventParams): Promise<SearchEventResponse> {
    // MODO MOCK: no exigimos country y ajustamos pageNumber a 1-based si viene 0
    if (this.isMocked()) {
      const p: SearchEventParams = {
        ...params,
        // muchos mocks usan 1-based; si recibimos 0, lo subimos a 1
        pageNumber: Math.max(1, Number(params.pageNumber ?? 0)),
      };
      // Permitir "Todos" (all) pero mantener el parámetro country
      if (params.country === 'all' || params.country === 'Todos') {
        return mockSearchEvents({ ...p, country: 'all' });
      }
      return mockSearchEvents(p);
    }

    // BE REAL: country obligatorio (evitamos golpear el API con 'all' o vacío)
    if (!params.country || !params.country.trim() || params.country.toLowerCase() === 'all') {
      return {
        events: [],
        currentPage: 0,
        pageSize: params.pageSize ?? 9,
        totalPages: 0,
        hasEventsInYourCity: false,
      };
    }

    const safeParams: SearchEventParams = {
      ...params,
      pageNumber: Math.max(0, Number(params.pageNumber ?? 0)), // 0-based para BE
    };

    const queryString = Object.entries(safeParams)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');

    const raw = await http.get<unknown>(
      `${this.BASE_URL}/api/public/v1/event/search?${queryString}`,
      { retries: 1 }
    );
    const parsed = SearchEventResponseSchema.parse(raw);
    logger.debug('searchEvents parsed', { count: parsed.events.length, page: parsed.currentPage, pageSize: parsed.pageSize });
    return parsed;
  }


  static async getPublicById(id: string): Promise<EventDetail> {
    if (this.isMocked()) {
      // Reutilizamos el mock privado por ahora
      return mockGetEventById(id);
    }
    const raw = await http.get<unknown>(`${this.BASE_URL}/api/public/v1/event/${encodeURIComponent(id)}`, { retries: 1 });
    // El esquema público y privado comparten forma para MVP (title, date, location, image, tickets...)
    const parsed = EventDetailSchema.parse(raw);
    logger.debug('getPublicById parsed', { id: parsed.id });
    return parsed;
  }

  static async getRecommendations(id: string): Promise<EventRecommendation[]> {
    if (this.isMocked()) {
      return []; // opcional: podrías mockear
    }
    const response = await http.get<EventRecommendation[]>(
      `${this.BASE_URL}/api/public/v1/event/${encodeURIComponent(id)}/recommendations`,
      { retries: 1 }
    );
    return response;
  }

  // Private/backoffice endpoints (se mantienen)
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
    const raw = await http.get<unknown>(`${this.BASE_URL}/api/v1/events/${id}`,
      { headers: { ...AuthService.getAuthHeader() }, retries: 1 }
    );
    const parsed = EventDetailSchema.parse(raw);
    logger.debug('getEventById parsed', { id: parsed.id });
    return parsed;
  }

  static async createEvent(event: Omit<EventDetail, 'id'>): Promise<EventDetail> {
    if (this.isMocked()) {
      // The mock function will add an ID
      return mockCreateEvent(event as EventDetail);
    }
    const user = AuthService.getCurrentUser();
    // Create a new object with a temporary ID that will be replaced by the server
    const payload: EventDetail = {
      ...event,
      id: 'temporary-id',
      organizer: AuthService.isSeller() && user
        ? {
            id: String(user.id),
            name: user.name,
            url: event.organizer?.url || '',
            logoUrl: event.organizer?.logoUrl,
          }
        : event.organizer ?? null,
    };

    const raw = await http.post<unknown>(
      `${this.BASE_URL}/api/v1/events`,
      payload,
      { headers: { ...AuthService.getAuthHeader() }, retries: 0 }
    );
    const parsed = EventDetailSchema.parse(raw);
    logger.info('createEvent success', { id: parsed.id });
    return parsed;
  }

  static async updateEvent(id: string, event: Partial<EventDetail>): Promise<EventDetail> {
    if (this.isMocked()) {
      return mockUpdateEvent(id, event);
    }
    const raw = await http.put<unknown>(
      `${this.BASE_URL}/api/v1/events/${id}`,
      event,
      { headers: { ...AuthService.getAuthHeader() }, retries: 0 }
    );
    const parsed = EventDetailSchema.parse(raw);
    logger.info('updateEvent success', { id: parsed.id });
    return parsed;
  }

  static async deleteEvent(id: string): Promise<void> {
    if (this.isMocked()) {
      return mockDeleteEvent(id);
    }
    await http.delete<void>(`${this.BASE_URL}/api/v1/events/${id}`,
      { headers: { ...AuthService.getAuthHeader() }, retries: 0 }
    );
    logger.warn('deleteEvent', { id });
  }
}
