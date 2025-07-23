// Location and Image interfaces are used in multiple places
export interface Location {
  name: string;
  address: string;
  city: string;
  country: string;
}

export interface Image {
  url: string;
  alt: string;
}

export interface Ticket {
  id: string;
  value: number;
  currency: string;
  type: string;
  isFree: boolean;
  stock: number;
}

export interface Organizer {
  id: string;
  name: string;
  url: string;
  logoUrl?: string;
}

export interface EventDetail {
  id: string;
  title: string;
  date: string;
  image: Image;
  tickets: Ticket[];
  description: string;
  additionalInfo: string[];
  organizer: Organizer | null;
  status: string;
  location: Location;
}

// For event lists (used in other components)
export interface EventForList {
  id: string;
  name: string;
  date: string;
  location: string;
  status: "ACTIVE" | "INACTIVE" | "SOLD_OUT";
}

export interface EventListResponse {
  events: EventForList[];
}
