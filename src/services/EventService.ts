import { Event } from '../types/Event';
import { EventDetail } from '../types/EventDetail';
import { ConfigService } from './ConfigService';

interface EventResponse {
  events: Event[];
}

export class EventService {
  private static BASE_URL = 'http://localhost:8080';

  private static isMocked(): boolean {
    return ConfigService.isMockedEnabled();
  }

  static async getEvents(): Promise<EventResponse> {
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

  static getMockEventById(id: string): EventDetail {
    if (id !== "dsdsf-1234-1234-1234") {
      throw new Error('Event not found');
    }
    return {
      id: "dsdsf-1234-1234-1234",
      title: "Concierto de Trueno",
      date: new Date("2022-01-01T20:00:00"),
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
          value: 100000,
          currency: "COP",
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

  static getMockEvents(): EventResponse {
    return {
      events: [
        {
          id: "dsdsf-1234-1234-1234",
          name: "Concierto de Trueno",
          date: new Date("2022-01-01T20:00:00"),
          location: "Movistar Arena",
          bannerUrl: "https://movistararena.co/wp-content/uploads/2025/02/trueno-2025-4.jpg",
          price: 100000,
          currency: "COP",
          status: "ACTIVE"
        }
      ]
    };
  }
}
