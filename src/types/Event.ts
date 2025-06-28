export interface Event {
  id: string;
  name: string;
  date: Date;
  location: string;
  bannerUrl: string;
  price: number;
  currency: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SOLD_OUT';
}
