import { SearchEventParams, SearchEventResponse } from '@/types/search-event';
import { EventDetail, EventForList } from '@/types/Event';
import { ConfigService } from './ConfigService';

// Mock data for development
const mockEventDetail: EventDetail = {
  id: '1',
  title: 'Concierto en Vivo',
  date: '2025-12-31T22:00:00',
  image: {
    url: 'https://sanangel.edu.mx/wp-content/uploads/2024/06/obra-de-teatro.webp',
    alt: 'Concierto en Vivo',
  },
  description: 'Un increíble concierto con los mejores artistas del momento. ¡No te lo pierdas!',
  additionalInfo: [
    'Entrada general',
    'Mayores de 18 años',
    'Se permiten cámaras sin flash',
  ],
  organizer: {
    id: 'org1',
    name: 'Productora de Eventos',
    url: 'https://example.com/organizer',
    logoUrl: 'https://via.placeholder.com/100x50?text=Organizer',
  },
  status: 'ACTIVE',
  location: {
    name: 'Estadio Monumental',
    address: 'Av. Pres. Figueroa Alcorta 7597',
    city: 'Buenos Aires',
    country: 'Argentina',
  },
  tickets: [
    {
      id: 'ticket1',
      type: 'General',
      value: 5000,
      currency: 'ARS',
      isFree: false,
      stock: 100,
    },
    {
      id: 'ticket2',
      type: 'VIP',
      value: 10000,
      currency: 'ARS',
      isFree: false,
      stock: 50,
    },
  ],
};

// Mock data for development
const mockEvents: EventForList[] = [
  {
    id: '1',
    name: 'Concierto en Vivo',
    date: '2025-12-31T22:00:00',
    location: 'Estadio Monumental, Buenos Aires',
    status: 'ACTIVE',
  },
  {
    id: '2',
    name: 'Festival de Música',
    date: '2025-11-15T18:00:00',
    location: 'Parque Sarmiento, Córdoba',
    status: 'ACTIVE',
  },
  {
    id: '3',
    name: 'Obra de Teatro',
    date: '2025-10-20T20:30:00',
    location: 'Teatro Colón, Buenos Aires',
    status: 'INACTIVE',
  },
];

const mockSearchEvents: SearchEventResponse = {
  events: mockEvents.map(event => ({
    ...event,
    bannerUrl: 'https://sanangel.edu.mx/wp-content/uploads/2024/06/obra-de-teatro.webp',
    price: Math.floor(Math.random() * 5000) + 1000,
    currency: 'ARS',
  })),
  hasEventsInYourCity: true,
  totalPages: 1,
  currentPage: 1,
  pageSize: 10,
};

export interface EventListResponse {
  events: EventForList[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class EventService {
  private static BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  private static isMocked(): boolean {
    return ConfigService.isMockedEnabled();
  }

  static async getEvents(page: number = 1, pageSize: number = 10): Promise<EventListResponse> {
    if (this.isMocked()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedEvents = mockEvents.slice(start, end);
      
      return {
        events: paginatedEvents,
        total: mockEvents.length,
        page,
        pageSize,
        totalPages: Math.ceil(mockEvents.length / pageSize),
      };
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}/api/v1/events?page=${page}&pageSize=${pageSize}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockSearchEvents;
    }

    try {
      const queryString = Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&');

      const response = await fetch(
        `${this.BASE_URL}/api/public/v1/event/search?${queryString}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ...mockEventDetail, id };
    }

    try {
      const response = await fetch(`${this.BASE_URL}/api/v1/events/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch event details');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching event details:', error);
      throw error;
    }
  }

  static async createEvent(event: EventDetail): Promise<EventDetail> {
    if (this.isMocked()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newEvent = {
        ...event,
        id: Math.random().toString(36).substr(2, 9),
      };
      mockEvents.push({
        id: newEvent.id,
        name: newEvent.title,
        date: newEvent.date,
        location: newEvent.location?.name || 'Sin ubicación',
        status: 'ACTIVE',
      });
      return newEvent;
    }

    try {
      const response = await fetch(`${this.BASE_URL}/api/v1/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      return response.json();
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  static async updateEvent(id: string, event: Partial<EventDetail>): Promise<EventDetail> {
    if (this.isMocked()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const index = mockEvents.findIndex(e => e.id === id);
      if (index === -1) {
        throw new Error('Event not found');
      }
      
      const updatedEvent = {
        ...mockEventDetail,
        ...event,
        id,
      };
      
      // Update the mock data
      mockEvents[index] = {
        id,
        name: event.title || mockEvents[index].name,
        date: event.date || mockEvents[index].date,
        location: event.location?.name || mockEvents[index].location,
        status: (event.status as 'ACTIVE' | 'INACTIVE' | 'SOLD_OUT') || mockEvents[index].status,
      };
      
      return updatedEvent;
    }

    try {
      const response = await fetch(`${this.BASE_URL}/api/v1/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      return response.json();
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  static async deleteEvent(id: string): Promise<void> {
    if (this.isMocked()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockEvents.findIndex(e => e.id === id);
      if (index !== -1) {
        mockEvents.splice(index, 1);
      }
      return;
    }

    try {
      const response = await fetch(`${this.BASE_URL}/api/v1/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
}
