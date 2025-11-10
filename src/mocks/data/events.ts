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

const feriaDelLibro: EventDetail = {
  id: '2',
  title: 'Feria del Libro',
  date: '2025-11-20T10:00:00',
  image: {
    url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    alt: 'Feria del Libro',
  },
  description: 'La feria del libro más importante de habla hispana, con presentaciones de autores, firmas de libros y actividades culturales.',
  additionalInfo: ['Entrada gratuita', 'Actividades para niños', 'Accesibilidad para personas con movilidad reducida'],
  organizer: {
    id: 'org2',
    name: 'Fundación El Libro',
    url: 'https://www.el-libro.org.ar',
    logoUrl: 'https://www.el-libro.org.ar/wp-content/uploads/2020/03/logo-fel-2020.png',
  },
  status: 'ACTIVE',
  location: {
    name: 'La Rural',
    address: 'Av. Sarmiento 2704',
    city: 'Buenos Aires',
    country: 'Argentina',
  },
  tickets: [
    { id: 'ticket4', type: 'Entrada general', value: 8000, currency: 'ARS', isFree: true, stock: 1000 },
  ],
};

const festivalVallenato: EventDetail = {
  id: '3',
  title: 'Festival de la Leyenda Vallenata',
  date: '2025-10-25T19:00:00',
  image: {
    url: 'https://images.unsplash.com/photo-1589409517114-4b0bdc7a4c8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    alt: 'Festival Vallenato',
  },
  description: 'El festival de música vallenata más importante del mundo, reuniendo a los mejores acordeoneros y compositores del género.',
  additionalInfo: ['Evento al aire libre', 'Se recomienda llevar silla plegable', 'Prohibido el ingreso de alimentos y bebidas'],
  organizer: {
    id: 'org3',
    name: 'Fundación Festival de la Leyenda Vallenata',
    url: 'https://festivalvallenato.com',
    logoUrl: 'https://festivalvallenato.com/wp-content/uploads/2020/02/logo-festival-vallenato.png',
  },
  status: 'ACTIVE',
  location: {
    name: 'Plaza Alfonso López',
    address: 'Carrera 7 # 16 - 20',
    city: 'Valledupar',
    country: 'Colombia',
  },
  tickets: [
    { id: 'ticket5', type: 'General', value: 150000, currency: 'COP', isFree: false, stock: 500 },
    { id: 'ticket6', type: 'VIP', value: 300000, currency: 'COP', isFree: false, stock: 200 },
  ],
};

const feriaDeLasFlores: EventDetail = {
  id: '4',
  title: 'Feria de las Flores',
  date: '2025-08-10T09:00:00',
  image: {
    url: 'https://images.unsplash.com/photo-1579586337278-3befd89cbfa2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    alt: 'Feria de las Flores',
  },
  description: 'El evento más emblemático de Medellín, celebrando la cultura paisa, la música y, por supuesto, las flores.',
  additionalInfo: ['Desfile de silleteros', 'Conciertos gratuitos', 'Evento familiar'],
  organizer: {
    id: 'org4',
    name: 'Alcaldía de Medellín',
    url: 'https://www.medellin.gov.co',
    logoUrl: 'https://www.medellin.gov.co/Imagenes/logo-medellin.png',
  },
  status: 'ACTIVE',
  location: {
    name: 'Zona Norte',
    address: 'Avenida La Playa',
    city: 'Medellín',
    country: 'Colombia',
  },
  tickets: [
    { id: 'ticket7', type: 'Asiento preferencial', value: 50000, currency: 'COP', isFree: false, stock: 200 },
    { id: 'ticket8', type: 'Asiento normal', value: 5000, currency: 'COP', isFree: true, stock: 5000 },
  ],
};

const mockEventsList: EventForList[] = [
  { id: '1', name: 'Concierto en Vivo', date: '2025-12-31T22:00:00', location: 'Buenos Aires, Argentina', status: 'ACTIVE' },
  { id: '2', name: 'Festival de Música', date: '2025-11-15T18:00:00', location: 'Córdoba, Argentina', status: 'ACTIVE' },
  { id: '3', name: 'Obra de Teatro', date: '2025-10-20T20:30:00', location: 'Buenos Aires, Argentina', status: 'INACTIVE' },
  { id: '4', name: 'Discoteca 1', date: '2025-10-20T20:30:00', location: 'Buenos Aires, Argentina', status: 'ACTIVE' },
  { id: '5', name: 'Discoteca 2', date: '2025-09-20T20:30:00', location: 'Córdoba, Argentina', status: 'INACTIVE' },
  { id: '6', name: 'Discoteca 3', date: '2025-08-20T20:30:00', location: 'Bogotá, Colombia', status: 'ACTIVE' },
  { id: '7', name: 'Discoteca 4', date: '2026-07-20T20:30:00', location: 'Bogotá, Colombia', status: 'INACTIVE' },
  { id: '8', name: 'Discoteca 5', date: '2026-06-20T20:30:00', location: 'Buenos Aires, Argentina', status: 'ACTIVE' },
  { id: '9', name: 'Discoteca 6', date: '2026-05-20T20:30:00', location: 'Bogotá, Colombia', status: 'INACTIVE' },
  { id: '10', name: 'Discoteca 7', date: '2026-04-20T20:30:00', location: 'Bogotá, Colombia', status: 'ACTIVE' },
  { id: '11', name: 'Festival de Tango', date: '2025-12-15T20:00:00', location: 'Buenos Aires, Argentina', status: 'ACTIVE' },
  { id: '12', name: 'Feria del Libro', date: '2025-11-20T10:00:00', location: 'Buenos Aires, Argentina', status: 'ACTIVE' },
  { id: '13', name: 'Festival de la Leyenda Vallenata', date: '2025-10-25T19:00:00', location: 'Valledupar, Colombia', status: 'ACTIVE' },
  { id: '14', name: 'Feria de las Flores', date: '2025-08-10T09:00:00', location: 'Medellín, Colombia', status: 'ACTIVE' },
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

  // Filtro básico por país/ciudad en el mock para coherencia
  let base = [...mockEventsList];
  if (params.country) base = base.filter((e) => e.location.endsWith(`, ${params.country}`));
  if (params.city) base = base.filter((e) => e.location.startsWith(`${params.city},`));

  // Date range (YYYY-MM-DD)
  if (params.dateFrom) {
    const from = Date.parse(params.dateFrom);
    base = base.filter((e) => Date.parse(e.date) >= from);
  }
  if (params.dateTo) {
    const to = Date.parse(params.dateTo) + 24 * 60 * 60 * 1000 - 1;
    base = base.filter((e) => Date.parse(e.date) <= to);
  }

 
  const events = base.map((e) => ({
    id: e.id,
    name: e.name,
    date: e.date,
    location: e.location, // "Ciudad, País"
    bannerUrl: 'https://sanangel.edu.mx/wp-content/uploads/2024/06/obra-de-teatro.webp',
    price: Math.floor(Math.random() * 5000) + 1000,
    currency: 'ARS',
    status: e.status,
  }));

  const pageSize = params.pageSize ?? 6;
  const pageNumber = params.pageNumber ?? 1;
  const totalPages = Math.max(1, Math.ceil(events.length / pageSize));
  const start = (pageNumber - 1) * pageSize;
  const slice = events.slice(start, start + pageSize);

  return {
    events: slice,
    hasEventsInYourCity: true,
    totalPages,
    currentPage: pageNumber,
    pageSize,
  };
}

export async function mockGetEventById(id: string): Promise<EventDetail> {
  await new Promise((r) => setTimeout(r, 400));
  
  const events: Record<string, EventDetail> = {
    '1': { ...mockEventDetailBase },
    '2': { ...feriaDelLibro },
    '3': { ...festivalVallenato },
    '4': { ...feriaDeLasFlores },
  };
  
  return events[id] || { ...mockEventDetailBase, id };
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