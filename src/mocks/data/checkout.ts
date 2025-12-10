import type { CheckoutSessionResponse, SessionDataRequest, SessionInfoResponse, ProcessPaymentResponse, BuyerData } from '@/types/checkout';

// Almacén temporal de sesiones (simulación de DB)
const mockSessions = new Map<string, {
  eventId: string;
  priceId: string;
  quantity: number;
  mainEmail?: string;
  buyer?: BuyerData[];
  status: 'pending' | 'paid' | 'expired' | 'failed';
  createdAt: number;
}>();

// Utilidad para simular latencia de red
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generar ID único
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Crear sesión de checkout (reservar stock)
 */
export async function mockCreateSession(eventId?: string, priceId?: string, quantity?: number): Promise<CheckoutSessionResponse> {
  await delay(300 + Math.random() * 200); // Latencia variable realista
  
  const sessionId = generateId('session');
  const expiredIn = 600; // 10 minutos
  
  // Guardar en "DB" mock
  mockSessions.set(sessionId, {
    eventId: eventId || 'evt-mock-001',
    priceId: priceId || 'ticket-mock-001',
    quantity: quantity || 1,
    status: 'pending',
    createdAt: Date.now(),
  });
  
  return {
    sessionId,
    expiredIn,
  };
}

/**
 * Obtener información de la sesión
 */
export async function mockGetSessionInfo(sessionId: string): Promise<SessionInfoResponse> {
  await delay(200 + Math.random() * 100);
  
  const session = mockSessions.get(sessionId);
  
  if (!session) {
    // Simular sesión por defecto si no existe
    return {
      sessionId,
      eventId: 'evt-mock-001',
      priceId: 'ticket-mock-001',
      quantity: 1,
      mainEmail: undefined,
      buyer: undefined,
    };
  }
  
  return {
    sessionId,
    eventId: session.eventId,
    priceId: session.priceId,
    quantity: session.quantity,
    mainEmail: session.mainEmail,
    buyer: session.buyer,
  };
}

/**
 * Guardar datos de comprador en la sesión
 */
export async function mockGetSessionInfoWithData(
  sessionId: string,
  data: SessionDataRequest
): Promise<SessionInfoResponse> {
  await delay(300 + Math.random() * 150);
  
  const session = mockSessions.get(sessionId);
  
  if (session) {
    session.mainEmail = data.mainEmail;
    session.buyer = data.buyer;
    mockSessions.set(sessionId, session);
  }
  
  return {
    sessionId,
    eventId: session?.eventId || 'evt-mock-001',
    priceId: session?.priceId || 'ticket-mock-001',
    quantity: session?.quantity || 1,
    mainEmail: data.mainEmail,
    buyer: data.buyer,
  };
}

/**
 * Simular procesamiento de pago (MercadoPago mock)
 * 
 * Comportamiento:
 * - 85% éxito → redirige a congrats
 * - 10% pendiente → redirige a congrats con status=pending
 * - 5% fallo → lanza error
 */
export async function mockProcessPayment(sessionId: string): Promise<ProcessPaymentResponse> {
  // Simular tiempo de procesamiento de pago (1.5-3 segundos)
  await delay(1500 + Math.random() * 1500);
  
  const random = Math.random();
  
  // 5% de probabilidad de fallo (para testing de error handling)
  if (random < 0.05) {
    const session = mockSessions.get(sessionId);
    if (session) {
      session.status = 'failed';
      mockSessions.set(sessionId, session);
    }
    
    return {
      success: false,
      error: 'El pago fue rechazado por el emisor de la tarjeta. Por favor, intenta con otro medio de pago.',
    };
  }
  
  // 10% de probabilidad de pendiente
  if (random < 0.15) {
    const session = mockSessions.get(sessionId);
    if (session) {
      session.status = 'pending';
      mockSessions.set(sessionId, session);
    }
    
    return {
      success: true,
      redirectUrl: `/checkout/congrats?sessionId=${sessionId}&status=pending`,
    };
  }
  
  // 85% de éxito
  const session = mockSessions.get(sessionId);
  if (session) {
    session.status = 'paid';
    mockSessions.set(sessionId, session);
  }
  
  return {
    success: true,
    redirectUrl: `/checkout/congrats?sessionId=${sessionId}&status=approved`,
  };
}

/**
 * Simular compra directa (sin MercadoPago, para entradas gratuitas)
 */
export async function mockBuyFree(sessionId: string, buyerData: { mainEmail: string; buyer: BuyerData[] }): Promise<void> {
  await delay(800 + Math.random() * 400);
  
  const session = mockSessions.get(sessionId);
  if (session) {
    session.mainEmail = buyerData.mainEmail;
    session.buyer = buyerData.buyer;
    session.status = 'paid';
    mockSessions.set(sessionId, session);
  }
}

/**
 * Verificar estado de pago
 */
export async function mockGetPaymentStatus(sessionId: string): Promise<{ status: 'pending' | 'paid' | 'failed' | 'expired' }> {
  await delay(200);
  
  const session = mockSessions.get(sessionId);
  
  if (!session) {
    return { status: 'expired' };
  }
  
  // Verificar si la sesión expiró (10 minutos)
  if (Date.now() - session.createdAt > 600000) {
    session.status = 'expired';
    mockSessions.set(sessionId, session);
  }
  
  return { status: session.status };
}

/**
 * Obtener tickets generados después de un pago exitoso
 */
export async function mockGetTicketsForSession(sessionId: string): Promise<{
  tickets: Array<{
    id: string;
    eventName: string;
    buyerName: string;
    buyerEmail: string;
    ticketType: string;
    qrCode: string;
  }>;
}> {
  await delay(300);
  
  const session = mockSessions.get(sessionId);
  
  if (!session || session.status !== 'paid') {
    return { tickets: [] };
  }
  
  const buyers = session.buyer || [{
    name: 'Comprador',
    lastName: 'Mock',
    email: session.mainEmail || 'mock@example.com',
  }];
  
  const tickets = buyers.map((buyer, index) => ({
    id: generateId('ticket'),
    eventName: 'Evento Mock',
    buyerName: `${buyer.name} ${buyer.lastName}`,
    buyerEmail: buyer.email,
    ticketType: 'General',
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${sessionId}-${index}`,
  }));
  
  return { tickets };
}