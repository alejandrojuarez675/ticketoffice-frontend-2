export interface Image {
  url: string;
  alt: string;
}

export interface Location {
  name: string;
  address: string;
  city: string;
  country: string;
}

export interface Organizer {
  id: string;
  name: string;
  url: string;
  logo: Image;
}

export interface Ticket {
  id: string;
  value: number;
  currency: string;
  type: string;
  isFree: boolean;
  stock: number;
}

export interface EventDetail {
  id: string;
  title: string;
  date: Date;
  location: Location;
  image: Image;
  tickets: Ticket[];
  description: string;
  additionalInfo: string[];
  organizer: Organizer;
  status: 'ACTIVE' | 'INACTIVE' | 'SOLD_OUT';
}
