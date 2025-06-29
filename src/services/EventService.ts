import { EventListResponse, EventDetail } from '../types/Event';
import { SearchEventParams, SearchEventResponse } from '../types/SearchEvent';
import { ConfigService } from './ConfigService';

export class EventService {
  private static BASE_URL = 'http://localhost:8080';

  private static isMocked(): boolean {
    return ConfigService.isMockedEnabled();
  }

  static async getEvents(): Promise<EventListResponse> {
    if (this.isMocked()) {
      return this.getMockEvents();
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
      return this.getMockSearchEvents();
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
      return this.getMockEventById(id);
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
      return this.getMockCreateEvent(event);
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
      return this.getMockCreateEvent(event);
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

  static getMockEventById(id: string): EventDetail {
    if (id !== "dsdsf-1234-1234-1234") {
      throw new Error('Event not found');
    }
    return {
      id: "dsdsf-1234-1234-1234",
      title: "Concierto de Trueno",
      date: "2022-01-01T20:00:00",
      location: {
        name: "Movistar Arena",
        address: "Dg. 61c #26-36",
        city: "Bogotá",
        country: "Colombia"
      },
      image: {
        url: "https://movistararena.co/wp-content/uploads/2025/02/trueno-2025-4.jpg",
        alt: "Concierto de Trueno"
      },
      tickets: [
        {
          id: "001b2f30-9a84-45e1-9345-518bea8a77c8",
          value: 100,
          currency: "$",
          type: "General",
          isFree: false,
          stock: 100
        }
      ],
      description: "Trueno es uno de los grandes artistas latinoamericanos de nuestros tiempos. Un rapero que comenzó destacándose en las batallas de freestyle en su natal Buenos Aires y hoy ha logrado el reconocimiento internacional además de acumular millones de oyentes en plataformas digitales. Este 7 de junio el Movistar Arena será testigo del prime de uno de los nuevos grandes del universo urbano.",
      additionalInfo: [
        "Prohibido el ingreso de menores de edad",
        "No se permite el ingreso de alimentos y bebidas",
        "No se permite el ingreso de cámaras fotográficas"
      ],
      organizer: {
        id: "001b2f30-9a84-45e1-9345-518bea8a77c8",
        name: "Movistar Arena",
        url: "https://movistararena.co/",
        logo: {
          url: "https://movistararena.co/wp-content/uploads/2025/02/trueno-2025-4.jpg",
          alt: "Concierto de Trueno"
        }
      },
      status: "ACTIVE"
    };
  }

  static getMockEvents(): EventListResponse {
    return {
      events: [
        {
          id: 'dsdsf-1234-1234-1234',
          name: 'Concierto de Trueno',
          date: '2025-06-29T20:00:00',
          location: 'Movistar Arena',
          status: 'ACTIVE'
        },
        {
          id: 'dsdsf-1234-1234-1234',
          name: 'Concierto de Bad Bunny',
          date: '2025-07-01T20:00:00',
          location: 'Movistar Arena',
          status: 'ACTIVE'
        }
      ]
    };
  }

  private static getMockSearchEvents(): SearchEventResponse {
    return {
      events: [
        {
          id: 'dsdsf-1234-1234-1234',
          name: 'Concierto de Trueno',
          date: '2025-06-29T20:00:00',
          location: 'Movistar Arena',
          bannerUrl: 'https://movistararena.co/wp-content/uploads/2025/02/trueno-2025-4.jpg',
          price: 100000,
          currency: 'COP',
          status: 'ACTIVE'
        },
        {
          id: 'dsdsf-1234-1234-1234',
          name: 'Concierto de Bad Bunny',
          date: '2025-07-01T20:00:00',
          location: 'Movistar Arena',
          bannerUrl: 'https://www.billboard.com/wp-content/uploads/2022/12/Bad-Bunny-Mexico-concert-2022-billboard-espanol-1548.jpg',
          price: 100000,
          currency: 'COP',
          status: 'ACTIVE'
        },
        {
          id: 'dsdsf-1234-1234-1234',
          name: 'Concierto de Maluma',
          date: '2025-07-01T20:00:00',
          location: 'Movistar Arena',
          bannerUrl: 'https://cloudfront-us-east-1.images.arcpublishing.com/artear/CFONB2XX45DHZL32KQ265QH26I.jpg',
          price: 100000,
          currency: 'COP',
          status: 'ACTIVE'
        }
      ],
      hasEventsInYourCity: true,
      totalPages: 1,
      currentPage: 1,
      pageSize: 2
    };
  }

  private static getMockCreateEvent(event: EventDetail): EventDetail {
    return {
      ...event,
      id: 'mock-id-' + Math.random().toString(36).substr(2, 9)
    };
  }
}
