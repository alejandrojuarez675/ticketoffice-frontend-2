import { SearchEventParams, SearchEventResponse } from '@/types/search-event';
import { EventDetail, EventForList } from '@/types/Event';
import { ConfigService } from './ConfigService';
import { AuthService } from './AuthService';
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

    const response = await fetch(
      `${this.BASE_URL}/api/v1/events?page=${page}&pageSize=${pageSize}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...AuthService.getAuthHeader(),
        },
      }
    );
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
  }

  static async searchEvents(params: SearchEventParams): Promise<SearchEventResponse> {
    if (this.isMocked()) {
      return mockSearchEvents(params);
    }

    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');

    const response = await fetch(
      `${this.BASE_URL}/api/public/v1/event/search?${queryString}`,
      { headers: { 'Content-Type': 'application/json' } }
    );
    if (!response.ok) throw new Error('Failed to search events');
    return response.json();
  }

  static async getEventById(id: string): Promise<EventDetail> {
    if (this.isMocked()) {
      return mockGetEventById(id);
    }

    const response = await fetch(`${this.BASE_URL}/api/v1/events/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeader(),
      },
    });
    if (!response.ok) throw new Error('Failed to fetch event details');
    return response.json();
  }

  static async createEvent(event: EventDetail): Promise<EventDetail> {
    if (this.isMocked()) {
      return mockCreateEvent(event);
    }

    const response = await fetch(`${this.BASE_URL}/api/v1/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify(event),
    });
    if (!response.ok) throw new Error('Failed to create event');
    return response.json();
  }

  static async updateEvent(id: string, event: Partial<EventDetail>): Promise<EventDetail> {
    if (this.isMocked()) {
      return mockUpdateEvent(id, event);
    }

    const response = await fetch(`${this.BASE_URL}/api/v1/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify(event),
    });
    if (!response.ok) throw new Error('Failed to update event');
    return response.json();
  }

  static async deleteEvent(id: string): Promise<void> {
    if (this.isMocked()) {
      return mockDeleteEvent(id);
    }

    const response = await fetch(`${this.BASE_URL}/api/v1/events/${id}`, {
      method: 'DELETE',
      headers: { ...AuthService.getAuthHeader() },
    });
    if (!response.ok) throw new Error('Failed to delete event');
  }
}