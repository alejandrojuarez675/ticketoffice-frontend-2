import type { SearchEventParams, SearchEventResponse } from '@/types/search-event';
import type { EventDetail, EventForList } from '@/types/Event';
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

  static async getEvents(page: number = 1, pageSize: number = 10): Promise<EventListResponse> {
    if (this.isMocked()) {
      return mockGetEvents(page, pageSize);
    }

    // If current user is a seller, scope listing to their events via query param
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

  static async searchEvents(params: SearchEventParams): Promise<SearchEventResponse> {
    if (this.isMocked()) {
      return mockSearchEvents(params);
    }

    const queryString = Object.entries(params)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');

    const raw = await http.get<unknown>(
      `${this.BASE_URL}/api/public/v1/event/search?${queryString}`,
      { retries: 1 }
    );
    const parsed = SearchEventResponseSchema.parse(raw);
    logger.debug('searchEvents parsed', { count: parsed.events.length, page: parsed.currentPage, pageSize: parsed.pageSize });
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

  static async createEvent(event: EventDetail): Promise<EventDetail> {
    if (this.isMocked()) {
      return mockCreateEvent(event);
    }

    // If seller is creating, ensure organizer is set to seller identity
    const user = AuthService.getCurrentUser();
    const payload: EventDetail = {
      ...event,
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