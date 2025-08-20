import type { EventDetail, EventForList } from '@/types/Event';
import type { SearchEventParams, SearchEventResponse } from '@/types/search-event';

const mockEventDetailBase: EventDetail = {
  id: '1',
  title: 'Concierto en Vivo',
  date: '2025-12-31T22:00:00',
  image: {
    url: 'https://sanangel.edu.mx/wp-content/uploads/2024/06/obra-de-teatro.webp',
    alt: 'Concierto en Vivo',
  },
  description: 'Un increíble concierto con los mejores artistas del momento. ¡No te lo pierdas!',
  additionalInfo: ['Entrada general', 'Mayores de 18 años', 'Se permiten cámaras sin flash'],
  organizer: {
    id: 'org1',
    name: 'Productora de Eventos',
    url: '',
    logoUrl: '',
  },
  status: 'ACTIVE',
  location: {
    name: 'Estadio Monumental',
    address: 'Av. Pres. Figueroa Alcorta 7597',
    city: 'Buenos Aires',
    country: 'Argentina',
  },
  tickets: [
    { id: 'ticket1', type: 'General', value: 5000, currency: 'ARS', isFree: false, stock: 100 },
    { id: 'ticket2', type: 'VIP', value: 10000, currency: 'ARS', isFree: false, stock: 50 },
  ],
};

let mockEventsList: EventForList[] = [
  { id: '1', name: 'Concierto en Vivo', date: '2025-12-31T22:00:00', location: 'Estadio Monumental, Buenos Aires', status: 'ACTIVE' },
  { id: '2', name: 'Festival de Música', date: '2025-11-15T18:00:00', location: 'Parque Sarmiento, Córdoba', status: 'ACTIVE' },
  { id: '3', name: 'Obra de Teatro', date: '2025-10-20T20:30:00', location: 'Teatro Colón, Buenos Aires', status: 'INACTIVE' },
];

export async function mockGetEvents(page = 1, pageSize = 10) {
  await new Promise((r) => setTimeout(r, 400));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const events = mockEventsList.slice(start, end);
  return {
    events,
    total: mockEventsList.length,
    page,
    pageSize,
    totalPages: Math.ceil(mockEventsList.length / pageSize),
  };
}

export async function mockSearchEvents(params: SearchEventParams): Promise<SearchEventResponse> {
  await new Promise((r) => setTimeout(r, 400));
  const events = mockEventsList.map((e) => ({
    id: e.id,
    name: e.name,
    date: e.date,
    location: e.location,
    bannerUrl: 'https://sanangel.edu.mx/wp-content/uploads/2024/06/obra-de-teatro.webp',
    price: Math.floor(Math.random() * 5000) + 1000,
    currency: 'ARS',
    status: e.status,
  }));
  return {
    events,
    hasEventsInYourCity: true,
    totalPages: 1,
    currentPage: 1,
    pageSize: params.pageSize ?? 10,
  };
}

export async function mockGetEventById(id: string): Promise<EventDetail> {
  await new Promise((r) => setTimeout(r, 400));
  return { ...mockEventDetailBase, id };
}

export async function mockCreateEvent(event: EventDetail): Promise<EventDetail> {
  await new Promise((r) => setTimeout(r, 600));
  const id = Math.random().toString(36).slice(2, 11);
  const newEvent = { ...event, id };
  mockEventsList.push({
    id,
    name: newEvent.title,
    date: newEvent.date,
    location: newEvent.location?.name || 'Sin ubicación',
    status: 'ACTIVE',
  });
  return newEvent;
}

export async function mockUpdateEvent(id: string, event: Partial<EventDetail>): Promise<EventDetail> {
  await new Promise((r) => setTimeout(r, 600));
  const idx = mockEventsList.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error('Event not found');

  mockEventsList[idx] = {
    id,
    name: event.title || mockEventsList[idx].name,
    date: event.date || mockEventsList[idx].date,
    location: event.location?.name || mockEventsList[idx].location,
    status: (event.status as 'ACTIVE' | 'INACTIVE' | 'SOLD_OUT') || mockEventsList[idx].status,
  };

  return { ...mockEventDetailBase, ...event, id };
}

export async function mockDeleteEvent(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
  const idx = mockEventsList.findIndex((e) => e.id === id);
  if (idx !== -1) mockEventsList.splice(idx, 1);
}