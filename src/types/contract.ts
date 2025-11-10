export type ImageDTO = { url: string; alt: string };
export type LocationDTO = { name: string; address: string; city: string; country: string };

export type TicketDTO = {
  id: string;
  value: number;          // si usan centavos, renombrar a amount
  currency: string;       // ideal: currencyCode ('COP' | 'ARS' | ...)
  type: string;           // 'General' | 'VIP'...
  isFree: boolean;
  stock: number;
};

export type EventDetailPageResponse = {
  id: string;
  title: string;
  date: string;           // ISO
  location: LocationDTO;
  image: ImageDTO;
  tickets: TicketDTO[];
  description?: string;
  additionalInfo?: string[];
  organizer?: OrganizerDTO;
  status: 'ACTIVE' | 'DRAFT' | string;
};

export type EventLightResponse = {
  id: string;
  name: string;
  date: string;
  location: string;
  bannerUrl: string;
  price: number;
  currency: string;       // ideal: currencyCode
  status: string;
};

export type SearchResponse = {
  events: EventLightResponse[];
  hasEventsInYourCity: boolean;
  totalPages: number;
  currentPage: number;    // confirmar 0-based
  pageSize: number;
};

export type CreateSessionRequest = {
  eventId: string;
  priceId: string;
  quantity: number;       // 1..5
};
export type SessionCreatedResponse = {
  sessionId: string;
  expiredIn: number;
};

export type PersonalData = {
  name: string;
  lastName: string;
  email: string;
  phone?: string;
  nationality?: string;
  documentType?: string;
  document?: string;
};

export type BuyTicketsRequest = {
  mainEmail: string;
  buyer: PersonalData[];  // length === quantity
};

export type SaleLightDTO = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  ticketType: string;
  price: number;
  validated: boolean;
};

export type SalesListResponse = { sales: SaleLightDTO[] };

export type UserResponse = {
  id: string;
  username: string;
  email: string;
  role: string[];         // e.g., ['ADMIN'] | ['SELLER'] | ['USER']
  organizer?: OrganizerDTO;
};

export type OrganizerDTO = {
  id: string;
  name: string;
  url: string;
  logo?: ImageDTO;
};

// Extensiones sugeridas BE:
export type CheckoutStatusResponse = {
  status: 'pending' | 'approved' | 'rejected' | 'free_issued';
  sales?: SaleLightDTO[];
  mainEmail?: string;
};
export type MpPreferenceResponse = { preferenceId: string; initPoint: string };