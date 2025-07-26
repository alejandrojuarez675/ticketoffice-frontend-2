export interface CheckoutSessionResponse {
  sessionId: string;
  expiredIn: number;
}

export interface BuyerData {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  documentType: string;
  document: string;
}

export interface SessionDataRequest {
  mainEmail: string;
  buyer: BuyerData[];
}

export interface SessionInfoResponse {
  sessionId: string;
  eventId: string;
  priceId: string;
  quantity: number;
  mainEmail?: string;
  buyer?: BuyerData[];
}

export interface ProcessPaymentResponse {
  success: boolean;
  redirectUrl?: string;
  error?: string;
}
