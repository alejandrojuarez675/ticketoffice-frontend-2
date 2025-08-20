import type { CheckoutSessionResponse, SessionDataRequest, SessionInfoResponse, ProcessPaymentResponse } from '@/types/checkout';

export async function mockCreateSession(): Promise<CheckoutSessionResponse> {
  await new Promise((r) => setTimeout(r, 300));
  return {
    sessionId: `mock-session-${Math.random().toString(36).substring(2, 15)}`,
    expiredIn: 10540,
  };
}

export async function mockGetSessionInfo(sessionId: string): Promise<SessionInfoResponse> {
  await new Promise((r) => setTimeout(r, 300));
  return {
    sessionId,
    eventId: `event-${Math.random().toString(36).substring(2, 10)}`,
    priceId: `ticket-${Math.random().toString(36).substring(2, 10)}`,
    quantity: 1,
    mainEmail: 'test@example.com',
    buyer: [
      {
        name: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        nationality: 'Argentina',
        documentType: 'DNI',
        document: '12345678',
      },
    ],
  };
}

export async function mockGetSessionInfoWithData(
  sessionId: string,
  data: SessionDataRequest
): Promise<SessionInfoResponse> {
  await new Promise((r) => setTimeout(r, 300));
  return {
    sessionId,
    eventId: `event-${Math.random().toString(36).substring(2, 10)}`,
    priceId: `ticket-${Math.random().toString(36).substring(2, 10)}`,
    quantity: 1,
    ...data,
  };
}

export async function mockProcessPayment(sessionId: string): Promise<ProcessPaymentResponse> {
  await new Promise((r) => setTimeout(r, 500));
  return { success: true, redirectUrl: `/congrats?sessionId=${sessionId}` };
}