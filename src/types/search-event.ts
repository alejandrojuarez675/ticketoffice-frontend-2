export interface SearchEvent {
  id: string;
  name: string;
  date: string;
  location: string; // "Ciudad, País"
  bannerUrl: string;
  price: number;
  currency: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SOLD_OUT';
  minAge?: number; 
}

export interface SearchEventResponse {
  events: SearchEvent[];
  hasEventsInYourCity: boolean;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface SearchEventParams {
  country?: string;
  city?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  pageSize?: number;
  pageNumber?: number;
}