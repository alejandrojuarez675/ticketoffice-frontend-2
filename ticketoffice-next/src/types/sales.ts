export interface SalesResponse {
    sales: Sale[];
  }
  
  export interface Sale {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    ticketType: string;
    price: number;
    validated: boolean;
  }