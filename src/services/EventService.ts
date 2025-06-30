import { EventListResponse, EventDetail } from '../types/Event';
import { SearchEventParams, SearchEventResponse } from '../types/SearchEvent';
import { ConfigService } from './ConfigService';
import { EventServiceMock } from '../mocks/EventServiceMock';

export class EventService {
  private static BASE_URL = 'http://localhost:8080';

  private static isMocked(): boolean {
    return ConfigService.isMockedEnabled();
  }

  static async getEvents(): Promise<EventListResponse> {
    if (this.isMocked()) {
      return EventServiceMock.getMockEvents();
    }

    try {
      const response = await fetch(`${this.BASE_URL}/api/v1/events`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  static async searchEvents(params: SearchEventParams): Promise<SearchEventResponse> {
    if (this.isMocked()) {
      return EventServiceMock.getMockSearchEvents();
    }

    try {
      const queryString = Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

      const response = await fetch(`${this.BASE_URL}/api/public/v1/event/search?${queryString}`);
      if (!response.ok) {
        throw new Error('Failed to search events');
      }
      return response.json();
    } catch (error) {
      console.error('Error searching events:', error);
      throw error;
    }
  }

  static async getEventById(id: string): Promise<EventDetail> {
    if (this.isMocked()) {
      return EventServiceMock.getMockEventById(id);
    }

    try {
      const response = await fetch(`${this.BASE_URL}/api/v1/events/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch event with id ${id}`);
      }
      const data = await response.json();
      return {
        ...data,
        date: new Date(data.date)
      };
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  }

  static async createEvent(event: EventDetail): Promise<EventDetail> {
    if (this.isMocked()) {
      return EventServiceMock.getMockCreateEvent(event);
    }

    try {
      const response = await fetch(`${this.BASE_URL}/api/v1/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        body: JSON.stringify(event)
      });

      if (response.status !== 201) {
        throw new Error(`Failed to create event. Status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  static async updateEventById(id: string, event: EventDetail): Promise<EventDetail> {
    if (this.isMocked()) {
      return EventServiceMock.getMockCreateEvent(event);
    }

    try {
      const response = await fetch(`${this.BASE_URL}/api/v1/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        throw new Error(`Failed to update event with id ${id}. Status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }
}
