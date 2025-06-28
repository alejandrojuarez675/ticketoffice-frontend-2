import { Event } from '../types/Event';

interface EventResponse {
  events: Event[];
}

export class EventService {
  private static BASE_URL = 'http://localhost:8080';

  static async getEvents(): Promise<EventResponse> {
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
