# MVP ROADMAP - Plataforma de Ticketing (Colombia/Argentina)

> **Documento Maestro de Auditoría y Planificación**  
> Última actualización: Diciembre 2025  
> Versión: 1.1 (Actualizado con documentación Postman)

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Definición de Arquitectura y Estándares](#2-definición-de-arquitectura-y-estándares)
3. [Análisis de Brechas (Gap Analysis)](#3-análisis-de-brechas-gap-analysis)
4. [Auditoría de Backend (Swagger/OpenAPI)](#4-auditoría-de-backend-swaggeropenapi)
5. [Plan de Acción Paso a Paso](#5-plan-de-acción-paso-a-paso)
6. [Anexos](#6-anexos)

---

## 🔄 Cambios Recientes (v1.1)

| Fecha | Cambio | Archivo |
|-------|--------|---------|
| Dic 2025 | Corregido endpoint `/users/me` → `/api/v1/users/me` | `AuthService.ts` |
| Dic 2025 | Mejorado UI de confirmación de compra (sin sessionId visible) | `CongratsClient.tsx` |
| Dic 2025 | Creado documento `MVP_PENDIENTES.md` con análisis detallado | Nuevo archivo |

---

## 1. Resumen Ejecutivo

### 1.1 Estado Actual del Proyecto

| Área | Estado | Observaciones |
|------|--------|---------------|
| **Infraestructura** | ✅ Funcional | Next.js 15, React 19, MUI 7, TypeScript |
| **Autenticación** | ✅ Funcional | Login/Register funcionan con BE real |
| **Eventos Públicos** | ✅ Funcional | Búsqueda, detalle, filtros implementados |
| **Checkout/Compra** | ✅ Funcional | Formulario y API de compra funcionan |
| **Backoffice Seller** | ✅ Funcional | CRUD eventos completo con BE real |
| **Backoffice Admin** | 🟡 Parcial | Usuarios/reportes deshabilitados por flags |
| **Validación Entradas** | 🟡 Parcial | Manual funciona, QR no implementado |
| **Tickets Digitales** | 🔴 Pendiente BE | Requiere endpoint `GET /api/public/v1/tickets/{id}` |
| **MercadoPago** | 🔴 Pendiente BE | Requiere endpoints de integración con MP |
| **Forgot/Reset Pass** | 🔴 Pendiente BE | Requiere endpoints de recuperación |

### 1.2 Stack Tecnológico

```
Frontend:
├── Next.js 15.4.3 (App Router)
├── React 19.1.0
├── TypeScript 5.5.4
├── Material UI 7.2.0
├── React Hook Form 7.62 + Zod 4.0
├── date-fns 4.1.0
└── TailwindCSS 3.4 (configurado pero poco usado)

Backend (según Swagger):
├── Spring Boot (Java)
├── OpenAPI 3.1.0
├── JWT Authentication
└── RESTful API
```

---

## 2. Definición de Arquitectura y Estándares

### 2.1 Arquitectura Pragmática para MVP (Next.js)

> ⚠️ **NOTA IMPORTANTE**: Se descarta la Clean Architecture estricta (Domain/Application/Infrastructure) por ser demasiado "boilerplate" para un MVP. Adoptamos un enfoque **pragmático** basado en **Services + Hooks**.

#### Principios de la Arquitectura MVP:

| ❌ Evitar | ✅ Preferir |
|-----------|-------------|
| Repositories para todo | Services directos con tipos |
| Use Cases formales | Custom Hooks que encapsulan lógica |
| DTOs + Mappers separados | Transformación inline en Services |
| Capas abstractas | Código directo y legible |

#### Estructura de Carpetas Recomendada:

```
src/
├── app/                       # App Router de Next.js (páginas)
│   ├── (public)/              # Rutas públicas (home, eventos)
│   ├── admin/                 # Backoffice (seller/admin)
│   ├── auth/                  # Autenticación
│   ├── checkout/              # Flujo de compra
│   ├── events/                # Detalle de eventos públicos
│   ├── tickets/               # Visualización de tickets
│   └── contexts/              # Contextos globales (Auth, Theme)
│
├── components/                # Componentes React reutilizables
│   ├── common/                # Componentes genéricos (Loading, Empty, Error)
│   ├── events/                # Componentes de eventos
│   ├── forms/                 # Inputs, validaciones
│   ├── layouts/               # Layouts (LightLayout, BackofficeLayout)
│   └── navigation/            # Navbar, Sidebar, Footer
│
├── services/                  # 🔑 SERVICIOS (lógica de negocio + API)
│   ├── AuthService.ts         # Autenticación
│   ├── EventService.ts        # CRUD eventos
│   ├── CheckoutService.ts     # Flujo de compra
│   ├── SalesService.ts        # Ventas y validación
│   ├── TicketService.ts       # Tickets digitales
│   ├── StatsService.ts        # Estadísticas
│   └── schemas/               # Validaciones Zod
│       ├── event.ts
│       ├── checkout.ts
│       └── sales.ts
│
├── hooks/                     # 🔑 CUSTOM HOOKS (lógica de UI)
│   ├── useAuth.ts             # Estado de autenticación
│   ├── useEventSearch.ts      # Búsqueda con debounce
│   ├── useCheckoutFlow.ts     # Flujo completo de compra
│   ├── useTicketValidation.ts # Validación de entradas
│   └── useDebouncedValue.ts   # Utilidad de debounce
│
├── mocks/                     # 🔑 DATOS SIMULADOS (crítico para MVP)
│   ├── data/
│   │   ├── events.ts          # Eventos mock
│   │   ├── users.ts           # Usuarios mock
│   │   ├── checkout.ts        # Sesiones mock
│   │   └── sales.ts           # Ventas mock
│   └── index.ts               # Exportaciones centralizadas
│
├── lib/                       # Utilidades de bajo nivel
│   ├── http.ts                # Cliente HTTP con interceptores
│   ├── logger.ts              # Logging
│   └── permissions.ts         # Sistema de permisos
│
├── config/                    # Configuración
│   ├── featureFlags.ts        # Feature toggles
│   └── backofficeNav.ts       # Navegación del backoffice
│
├── types/                     # Tipos TypeScript globales
│   ├── Event.ts
│   ├── user.ts
│   ├── checkout.ts
│   └── Sales.ts
│
└── utils/                     # Funciones utilitarias
    ├── format.ts              # Formateo de moneda, fechas
    ├── date.ts                # Manejo de fechas
    └── favorites.ts           # LocalStorage helpers
```

#### ¿Por qué esta estructura?

1. **Flat y navegable**: No más de 2-3 niveles de profundidad
2. **Co-localización**: Schemas junto a Services que los usan
3. **Mocks de primera clase**: Carpeta dedicada, no escondidos
4. **Hooks como orquestadores**: Encapsulan lógica compleja de UI
5. **Sin boilerplate**: No hay Repositories, UseCases, Mappers innecesarios

### 2.2 Patrones de Diseño Pragmáticos

> 🎯 **Filosofía**: Código simple > Abstracción elegante. Si un patrón no resuelve un problema real, no lo uses.

#### 2.2.1 Service Pattern (En lugar de Repository)

Los Services son clases/módulos que encapsulan llamadas a API y lógica de transformación de datos **en un solo lugar**.

```typescript
// ✅ PRAGMÁTICO: services/EventService.ts
export class EventService {
  private static BASE_URL = ConfigService.getApiBase();

  // Mock automático si está habilitado
  static async getPublicById(id: string): Promise<EventDetail> {
    if (ConfigService.isMockedEnabled()) {
      return mockGetEventById(id); // ← Mock directo
    }
    
    const raw = await http.get<unknown>(`${this.BASE_URL}/api/public/v1/event/${id}`);
    return EventDetailSchema.parse(raw); // ← Validación Zod inline
  }

  static async search(params: SearchParams): Promise<SearchResponse> {
    if (ConfigService.isMockedEnabled()) {
      return mockSearchEvents(params);
    }
    // ... llamada real
  }
}
```

**Beneficios**:
- Un archivo = una responsabilidad (eventos)
- Mock integrado, no separado
- Validación Zod inline, sin Mappers
- Fácil de testear y debuggear

#### 2.2.2 Custom Hooks Pattern (En lugar de Use Cases)

Los Hooks encapsulan lógica de UI compleja: estados, efectos, callbacks.

```typescript
// ✅ PRAGMÁTICO: hooks/useCheckoutFlow.ts
export function useCheckoutFlow(sessionId: string) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submitPurchase = useCallback(async (buyerData: BuyerData[]) => {
    setState('loading');
    setError(null);
    
    try {
      // Simular pago (MVP) o llamar API real
      if (ConfigService.isMockedEnabled()) {
        await mockProcessPayment(sessionId);
      } else {
        await CheckoutService.buy(sessionId, { mainEmail: buyerData[0].email, buyer: buyerData });
      }
      
      setState('success');
      router.push(`/checkout/congrats?sessionId=${sessionId}`);
    } catch (e) {
      setState('error');
      setError(e instanceof Error ? e.message : 'Error al procesar el pago');
    }
  }, [sessionId, router]);

  return { state, error, submitPurchase };
}
```

**Beneficios**:
- Lógica reutilizable entre componentes
- Estados de carga/error incluidos
- Fácil de consumir: `const { state, submitPurchase } = useCheckoutFlow(id)`

#### 2.2.3 Schema Validation Pattern (Zod)

Validación de datos en el punto de entrada (API responses).

```typescript
// ✅ PRAGMÁTICO: services/schemas/event.ts
import { z } from 'zod';

export const EventDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string().transform(d => new Date(d).toISOString()), // Transformación inline
  location: z.object({
    name: z.string(),
    address: z.string(),
    city: z.string(),
    country: z.string(),
  }),
  tickets: z.array(z.object({
    id: z.string(),
    type: z.string(),
    value: z.number(),
    stock: z.number(),
    isFree: z.boolean(),
  })),
  // ... rest
});

export type EventDetail = z.infer<typeof EventDetailSchema>;
```

**Beneficios**:
- Tipos TypeScript generados automáticamente
- Validación en runtime (la API puede cambiar)
- Transformaciones incluidas

#### 2.2.4 Error Boundary Pattern (React)

Captura errores críticos y muestra UI de fallback.

```typescript
// ✅ NUEVO: components/common/GlobalErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
          <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            ¡Algo salió mal!
          </Typography>
          <Typography color="text.secondary" paragraph>
            Ha ocurrido un error inesperado. Por favor, intenta nuevamente.
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" onClick={this.handleRetry}>
              Reintentar
            </Button>
            <Button variant="outlined" href="/">
              Ir al inicio
            </Button>
          </Box>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1, textAlign: 'left' }}>
              <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                {this.state.error.stack}
              </Typography>
            </Box>
          )}
        </Container>
      );
    }

    return this.props.children;
  }
}
```

### 2.3 🔑 Estrategia de Mocks (Crítico para MVP)

> **REGLA DE ORO**: El frontend DEBE funcionar al 100% sin backend. Los mocks no son "parches", son la base del desarrollo.

#### 2.3.1 Configuración de Mock Mode

```typescript
// services/ConfigService.ts
export class ConfigService {
  static isMockedEnabled(): boolean {
    // En desarrollo: siempre mock a menos que se especifique
    // En producción: siempre API real
    if (process.env.NODE_ENV === 'production') {
      return false; // ← Nunca mocks en producción
    }
    const v = (process.env.NEXT_PUBLIC_USE_MOCKS || 'true').toLowerCase();
    return v === 'true' || v === '1';
  }
}
```

#### 2.3.2 Estructura de Mocks

```typescript
// mocks/data/events.ts
export const MOCK_EVENTS: EventDetail[] = [
  {
    id: 'evt-001',
    title: 'Concierto de Trueno',
    date: '2025-06-07T20:00:00',
    location: { name: 'Movistar Arena', city: 'Bogotá', country: 'Colombia', address: 'Calle 123' },
    tickets: [
      { id: 't1', type: 'General', value: 150000, currency: 'COP', isFree: false, stock: 100 },
      { id: 't2', type: 'VIP', value: 350000, currency: 'COP', isFree: false, stock: 20 },
    ],
    // ...
  },
  // más eventos...
];

// Funciones de mock que simulan latencia
export async function mockGetEventById(id: string): Promise<EventDetail> {
  await delay(300); // Simular latencia de red
  const event = MOCK_EVENTS.find(e => e.id === id);
  if (!event) throw new Error('Evento no encontrado');
  return event;
}

export async function mockSearchEvents(params: SearchParams): Promise<SearchResponse> {
  await delay(400);
  let filtered = [...MOCK_EVENTS];
  if (params.country && params.country !== 'all') {
    filtered = filtered.filter(e => e.location.country === params.country);
  }
  if (params.query) {
    filtered = filtered.filter(e => e.title.toLowerCase().includes(params.query!.toLowerCase()));
  }
  return {
    events: filtered.slice(0, params.pageSize || 9),
    totalPages: Math.ceil(filtered.length / (params.pageSize || 9)),
    currentPage: params.pageNumber || 0,
    pageSize: params.pageSize || 9,
    hasEventsInYourCity: true,
  };
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

#### 2.3.3 Mock de MercadoPago (Simulación de Pago)

```typescript
// mocks/data/checkout.ts
export async function mockProcessPayment(sessionId: string): Promise<{ success: boolean; redirectUrl: string }> {
  await delay(2000); // Simular procesamiento de pago
  
  // 90% de probabilidad de éxito para testing
  const success = Math.random() > 0.1;
  
  if (!success) {
    throw new Error('Pago rechazado (simulación)');
  }
  
  return {
    success: true,
    redirectUrl: `/checkout/congrats?sessionId=${sessionId}&status=approved`,
  };
}

export async function mockCreateSession(): Promise<CheckoutSessionResponse> {
  await delay(500);
  return {
    sessionId: `session_${Date.now()}`,
    expiredIn: 600, // 10 minutos
  };
}
```

#### 2.3.4 Patrón de Uso en Services

```typescript
// services/CheckoutService.ts
export class CheckoutService {
  static async processPayment(sessionId: string): Promise<ProcessPaymentResponse> {
    // 🔑 Mock primero, API después
    if (ConfigService.isMockedEnabled()) {
      return mockProcessPayment(sessionId);
    }
    
    // API real (cuando el endpoint exista)
    return http.post<ProcessPaymentResponse>(
      `${this.BASE_URL}/api/public/v1/checkout/session/${sessionId}/process-payment`,
      { returnUrls: { success: '/checkout/congrats', failure: '/checkout', pending: '/checkout' } }
    );
  }
}
```

#### 2.3.5 Indicador Visual de Mock Mode (Solo Desarrollo)

```typescript
// components/common/MockModeIndicator.tsx
'use client';

import { Chip, Box } from '@mui/material';
import { ConfigService } from '@/services/ConfigService';

export function MockModeIndicator() {
  if (process.env.NODE_ENV === 'production') return null;
  if (!ConfigService.isMockedEnabled()) return null;

  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
      <Chip
        label="🧪 MOCK MODE"
        color="warning"
        size="small"
        sx={{ fontWeight: 'bold' }}
      />
    </Box>
  );
}
```

### 2.4 Principios SOLID (Aplicación Pragmática)

| Principio | Aplicación Pragmática en MVP |
|-----------|------------------------------|
| **S**ingle Responsibility | Cada Service maneja un dominio (eventos, auth, checkout). Cada Hook encapsula una funcionalidad de UI. |
| **O**pen/Closed | Services abiertos a extensión via mocks (`if (isMocked) { ... }`). No necesitamos interfaces abstractas. |
| **L**iskov Substitution | Mock functions son intercambiables con API calls (misma firma). |
| **I**nterface Segregation | Tipos TypeScript pequeños y específicos (`EventDetail`, `EventForList`). |
| **D**ependency Inversion | ConfigService decide si usar mock o API. El código de negocio no sabe cuál se usa. |

> 💡 **Nota**: En un MVP, aplicamos SOLID de forma **ligera**. No creamos interfaces abstractas para todo, pero sí mantenemos la separación de responsabilidades.

### 2.6 Convenciones de Código

```typescript
// ✅ CORRECTO: Nombrado descriptivo
export interface EventSearchParams {
  country: string;
  city?: string;
  query?: string;
  pageSize?: number;
  pageNumber?: number;
}

// ❌ INCORRECTO: Nombres genéricos
export interface Params {
  c: string;
  ci?: string;
  q?: string;
}

// ✅ CORRECTO: Error handling explícito
class EventNotFoundError extends Error {
  constructor(eventId: string) {
    super(`Event with id ${eventId} not found`);
    this.name = 'EventNotFoundError';
  }
}

// ✅ CORRECTO: Componentes con responsabilidad única
// EventCard solo renderiza un evento
// EventList maneja la lista
// EventSearchContainer coordina búsqueda + lista
```

### 2.7 Pantalla de Error Global (Crítico)

> ⚠️ **OBLIGATORIO**: Toda aplicación debe tener un fallback para errores críticos.

La aplicación debe mostrar una pantalla de error amigable cuando ocurra un fallo crítico, en lugar de mostrar un error técnico o página en blanco.

**Implementación**: Ver `GlobalErrorBoundary` en sección 2.2.4

**Uso en layout principal**:

```typescript
// app/layout.tsx
import { GlobalErrorBoundary } from '@/components/common/GlobalErrorBoundary';
import { MockModeIndicator } from '@/components/common/MockModeIndicator';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <GlobalErrorBoundary>
          <AuthProvider>
            <ThemeProvider>
              {children}
              <MockModeIndicator />
            </ThemeProvider>
          </AuthProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
```

---

## 3. Análisis de Brechas (Gap Analysis)

### 3.1 Estado de Servicios Frontend vs Requerimientos MVP

| Servicio | Estado | Integrado BE | Mock | Observaciones |
|----------|--------|--------------|------|---------------|
| `AuthService` | 🟡 Parcial | ✅ login/register/me | ✅ | Falta: forgot/reset password, verifyEmail |
| `EventService` | ✅ Completo | ✅ Todos | ✅ | CRUD + Search funcionando |
| `CheckoutService` | 🟡 Parcial | ✅ createSession, buy | ✅ | Falta: getSession, processPayment (MercadoPago) |
| `SalesService` | ✅ Funcional | ✅ listByEvent, validate | ❌ | Endpoint global `list()` no existe en BE |
| `TicketService` | 🔴 Solo Mock | ❌ | ✅ | No hay endpoint público de tickets en BE |
| `StatsService` | 🔴 Solo Mock | ❌ | ✅ | No existen endpoints de estadísticas |
| `CouponService` | 🔴 Solo Mock | ❌ | ✅ | No existen endpoints de cupones |
| `VendorService` | 🔴 Solo Mock | ❌ | ✅ | No existen endpoints de vendedores |
| `ReportService` | 🔴 Solo Mock | ❌ | ✅ | No existen endpoints de reportes |
| `ValidatorService` | ✅ Funcional | ✅ | ❌ | Duplica lógica de SalesService.validate |

### 3.2 Bugs y Problemas Identificados

#### 3.2.1 Bugs Críticos

| ID | Archivo | Descripción | Impacto |
|----|---------|-------------|---------|
| BUG-001 | `CheckoutService.ts:63-65` | `processPayment()` lanza error siempre | 🔴 Bloqueante - No se puede pagar |
| BUG-002 | `checkout/[sessionId]/page.tsx:91` | Regex de email incorrecto (`\\S` en lugar de `\S`) | 🟡 Validación falla |
| BUG-003 | `MercadoPagoApi.ts:40` | Llama a `processPayment` que no funciona | 🔴 Bloqueante |
| BUG-004 | `AuthService.ts:268-273` | Stubs lanzan error para features no-MVP | 🟡 UX confusa si usuario intenta usarlos |

#### 3.2.2 Deuda Técnica

| ID | Tipo | Ubicación | Descripción |
|----|------|-----------|-------------|
| DEBT-001 | Duplicación | `ValidatorService` vs `SalesService` | Misma lógica de validación duplicada |
| DEBT-002 | Hardcoding | `checkout/[sessionId]/page.tsx:22-27` | Lista de países hardcodeada |
| DEBT-003 | Type Safety | `EventService.ts:63-66` | `unknown` en lugar de tipos específicos |
| DEBT-004 | Mock Data | Múltiples servicios | Datos mock mezclados con lógica real |
| DEBT-005 | Feature Flags | `featureFlags.ts` | 5 de 9 features deshabilitadas |
| DEBT-006 | Inconsistencia | API vs Frontend | Fechas: array vs ISO string |
| DEBT-007 | Storage | `checkout/[sessionId]/page.tsx:54-55` | Session meta en localStorage (no persistente entre dispositivos) |

#### 3.2.3 Componentes con Datos Hardcodeados

```typescript
// ❌ src/app/(public)/page.tsx - Features hardcodeadas
const features = [
  { title: 'Gestión de Eventos', description: '...', icon: '📅' },
  { title: 'Venta de Boletos', description: '...', icon: '🎟️' },
  { title: 'Reportes en Tiempo Real', description: '...', icon: '📊' },
];

// ❌ src/app/checkout/[sessionId]/page.tsx - Países hardcodeados
const COUNTRIES = [
  'Argentina', 'Bolivia', 'Brasil', ...
];

// ❌ src/services/AuthService.ts - Usuarios mock
const MOCK_USERS: User[] = [
  { id: 1, username: 'admin', password: 'Admin123', ... },
  ...
];
```

### 3.3 Análisis de Feature Flags

```typescript
// src/config/featureFlags.ts - Estado actual
export const FEATURES: FeatureFlags = {
  // MVP ON ✅
  DASHBOARD: true,
  EVENTS: true,
  VALIDATE: true,
  TICKETS: true,
  
  // MVP OFF ❌ (ocultas, necesitan trabajo)
  PROFILE: true,     // Habilitado - redirige aquí después del registro
  REPORTS: false,    // Falta: Endpoints de estadísticas
  USERS: false,      // Falta: Endpoints de vendedores
  SETTINGS: false,   // Falta: Configuración de cuenta
  COUPONS: false,    // Falta: Endpoints de cupones
};
```

### 3.4 Cobertura de Funcionalidades MVP

#### Experiencia del Comprador (Buyer)

| Funcionalidad | Estado | Notas |
|---------------|--------|-------|
| Home con eventos destacados | ✅ | Funciona con CO + AR |
| Búsqueda de eventos | ✅ | Por país, ciudad, query |
| Detalle de evento | ✅ | Con tipos de tickets |
| Selección de tickets | ✅ | Cantidad, precio |
| Checkout formulario | ✅ | Datos de compradores |
| Integración MercadoPago | 🔴 | **NO FUNCIONA** |
| Página de éxito | 🟡 | Existe pero sin tickets reales |
| Visualización de boletas | 🔴 | Solo mock |
| Recuperación por email | 🔴 | No implementado |

#### Experiencia del Organizador (Seller)

| Funcionalidad | Estado | Notas |
|---------------|--------|-------|
| Registro de organizador | ✅ | Básico, sin perfil completo |
| Dashboard | 🟡 | Métricas hardcodeadas |
| Crear evento | ✅ | CRUD completo |
| Editar evento | ✅ | Funcional |
| Ver ventas | ✅ | Lista de ventas por evento |
| Validar entrada manual | ✅ | Por ID de venta |
| Validar entrada QR | 🔴 | "En desarrollo" |
| Estadísticas | 🔴 | Solo mock |
| Solicitud retiro dinero | 🔴 | No existe |

#### Administración (Admin)

| Funcionalidad | Estado | Notas |
|---------------|--------|-------|
| Ver todos los eventos | 🟡 | Mismo que seller |
| Gestionar vendedores | 🔴 | Deshabilitado por flag |
| Configuración global | 🔴 | Deshabilitado por flag |
| Reportes globales | 🔴 | Deshabilitado por flag |

---

## 4. Auditoría de Backend (Documentación Postman - Actualizada)

### 4.1 Endpoints Existentes vs Implementación Frontend

> **Base URL de Producción**: `https://yscqvjs2zg.us-east-1.awsapprunner.com`

| Endpoint | Método | Frontend | Estado |
|----------|--------|----------|--------|
| `/auth/login` | POST | `AuthService.login()` | ✅ Integrado |
| `/auth/signup` | POST | `AuthService.register()` | ✅ Integrado |
| `/api/v1/users/me` | GET | `AuthService.me()` | ✅ Integrado (corregido) |
| `/api/v1/users` | GET | No usado | ⚪ Admin only |
| `/api/v1/events` | GET | `EventService.getEvents()` | ✅ Integrado |
| `/api/v1/events` | POST | `EventService.createEvent()` | ✅ Integrado |
| `/api/v1/events/{id}` | GET | `EventService.getEventById()` | ✅ Integrado |
| `/api/v1/events/{id}` | PUT | `EventService.updateEvent()` | ✅ Integrado |
| `/api/v1/events/{id}` | DELETE | `EventService.deleteEvent()` | ✅ Integrado |
| `/api/public/v1/event/search` | GET | `EventService.searchEvents()` | ✅ Integrado |
| `/api/public/v1/event/{id}` | GET | `EventService.getPublicById()` | ✅ Integrado |
| `/api/public/v1/event/{id}/recommendations` | GET | `EventService.getRecommendations()` | ✅ Integrado |
| `/api/public/v1/checkout/session` | POST | `CheckoutService.createSession()` | ✅ Integrado |
| `/api/public/v1/checkout/session/{id}/buy` | POST | `CheckoutService.buy()` | ✅ Integrado |
| `/ping` | GET | No usado | ⚪ Health check |

### 4.1.1 Formato de Request/Response del Backend

**Login** (`POST /auth/login`):
```json
// Request
{ "username": "string", "password": "string" }
// Response
{ "token": "eyJ...", "expiresIn": 864000000 }
```

**Signup** (`POST /auth/signup`):
```json
// Request
{ "username": "string", "password": "string", "email": "string" }
// Response
{ "token": "eyJ...", "expiresIn": 864000000 }
```

**Create Event** (`POST /api/v1/events`):
```json
{
  "title": "Concierto de La Joaqui",
  "date": "2042-01-01T20:00:00",
  "location": {
    "name": "Huracan",
    "address": "Manuel Belgrano",
    "city": "Buenos Aires",
    "country": "Argentina"
  },
  "image": {
    "url": "https://...",
    "alt": "Descripción de imagen"
  },
  "tickets": [{
    "value": 100,
    "currency": "$",
    "type": "General",
    "isFree": false,
    "stock": 100
  }],
  "description": "Descripción del evento...",
  "additionalInfo": ["Info adicional 1", "Info adicional 2"]
}
```

**Create Checkout Session** (`POST /api/public/v1/checkout/session`):
```json
// Request
{ "eventId": "uuid", "priceId": "ticketId", "quantity": 1 }
// Response
{ "sessionId": "uuid__uuid__qty__timestamp" }
```

**Buy** (`POST /api/public/v1/checkout/session/{sessionId}/buy`):
```json
// Request
{
  "mainEmail": "email@example.com",
  "buyer": [{
    "name": "John",
    "lastName": "Doe",
    "email": "email@example.com",
    "phone": "+573012345678",
    "nationality": "Colombia",
    "documentType": "CC",
    "document": "123456789"
  }]
}
```

### 4.2 🔴 Endpoints Faltantes en Backend (Críticos para MVP)

Estos endpoints **NO EXISTEN** en el Swagger pero son **NECESARIOS** para el MVP:

#### 4.2.1 Autenticación y Usuarios

```yaml
# Recuperación de contraseña
POST /auth/forgot-password
  Request: { email: string }
  Response: { message: string }

POST /auth/reset-password
  Request: { token: string, newPassword: string }
  Response: { success: boolean }

# Verificación de email (opcional para MVP)
POST /auth/verify-email
  Request: { token: string }
  Response: { success: boolean }

# Verificar disponibilidad (UX mejorada en registro)
GET /auth/check-availability
  Query: { username?: string, email?: string }
  Response: { usernameAvailable?: boolean, emailAvailable?: boolean }
```

#### 4.2.2 Pagos (MercadoPago)

```yaml
# Crear preferencia de pago
POST /api/public/v1/checkout/session/{sessionId}/process-payment
  Request: { returnUrls: { success, failure, pending } }
  Response: { 
    success: boolean,
    redirectUrl: string,  # init_point de MercadoPago
    preferenceId: string
  }

# Webhook de MercadoPago
POST /api/webhooks/mercadopago
  Request: (MercadoPago IPN payload)
  Response: { received: true }

# Consultar estado de pago
GET /api/public/v1/checkout/session/{sessionId}/payment-status
  Response: { 
    status: 'pending' | 'approved' | 'rejected' | 'cancelled',
    paymentId?: string
  }
```

#### 4.2.3 Tickets Digitales

```yaml
# Obtener ticket por ID (público, para QR)
GET /api/public/v1/tickets/{ticketId}
  Response: {
    id: string,
    eventId: string,
    eventName: string,
    eventDate: string,
    buyerName: string,
    buyerEmail: string,
    ticketType: string,
    qrCode: string,  # Base64 o URL del QR
    isValid: boolean,
    validatedAt?: string
  }

# Obtener tickets por sesión/orden
GET /api/public/v1/checkout/session/{sessionId}/tickets
  Response: { tickets: Ticket[] }

# Reenviar tickets por email
POST /api/public/v1/checkout/session/{sessionId}/resend-tickets
  Request: { email: string }
  Response: { success: boolean }
```

#### 4.2.4 Estadísticas y Reportes

```yaml
# Estadísticas del organizador
GET /api/v1/stats/seller
  Response: {
    totalEvents: number,
    activeEvents: number,
    ticketsSold: number,
    totalRevenue: number,
    revenueByEvent: { eventId, name, sold, revenue }[],
    salesTrend: { date, count, amount }[]
  }

# Estadísticas globales (admin)
GET /api/v1/stats/global
  Response: {
    totalEvents: number,
    totalOrganizers: number,
    totalTicketsSold: number,
    totalRevenue: number,
    topEvents: { eventId, name, ticketsSold }[]
  }

# Reporte de ventas con filtros
GET /api/v1/reports/sales
  Query: { from?, to?, eventId?, status?, page, pageSize }
  Response: {
    items: SaleReport[],
    total: number,
    page: number,
    totalPages: number
  }

# Exportar reporte (CSV/Excel)
GET /api/v1/reports/sales/export
  Query: { from?, to?, eventId?, format: 'csv' | 'xlsx' }
  Response: Binary file
```

#### 4.2.5 Gestión de Vendedores (Admin)

```yaml
# Listar vendedores
GET /api/v1/vendors
  Response: { vendors: Vendor[] }

# Invitar vendedor
POST /api/v1/vendors/invite
  Request: { name: string, email: string }
  Response: { vendor: Vendor }

# Activar/Desactivar vendedor
PATCH /api/v1/vendors/{id}/status
  Request: { active: boolean }
  Response: { success: boolean }
```

#### 4.2.6 Cupones de Descuento

```yaml
# Listar cupones de un evento
GET /api/v1/events/{eventId}/coupons
  Response: { coupons: Coupon[] }

# Crear cupón
POST /api/v1/events/{eventId}/coupons
  Request: { code, type, value, maxUses?, expiresAt? }
  Response: { coupon: Coupon }

# Validar cupón (público, en checkout)
POST /api/public/v1/checkout/validate-coupon
  Request: { eventId: string, code: string }
  Response: { 
    valid: boolean,
    discount?: { type, value },
    message?: string
  }
```

#### 4.2.7 Finanzas (Retiro de Dinero)

```yaml
# Obtener balance del organizador
GET /api/v1/finance/balance
  Response: {
    available: number,
    pending: number,
    currency: string
  }

# Solicitar retiro
POST /api/v1/finance/withdrawal
  Request: { amount: number, bankAccount: BankAccount }
  Response: { 
    withdrawalId: string,
    status: 'pending' | 'processing'
  }

# Historial de retiros
GET /api/v1/finance/withdrawals
  Response: { withdrawals: Withdrawal[] }
```

### 4.3 🟡 Mejoras de Datos en Endpoints Existentes

#### 4.3.1 `/auth/signup` - Datos Adicionales

```yaml
# Actual
Request: { username, password, email }

# Sugerido para MVP completo
Request: {
  username: string,
  password: string,
  email: string,
  firstName?: string,      # FE ya lo recolecta pero BE no lo recibe
  lastName?: string,       # FE ya lo recolecta pero BE no lo recibe
  phone?: string,          # Útil para notificaciones
  role?: 'USER' | 'SELLER' # Para distinguir compradores de organizadores
}
```

#### 4.3.2 `EventCrudRequest` - Campos de Auditoría

```yaml
# Actual
{ title, date, location, image, tickets, description, additionalInfo }

# Sugerido
{
  ...existing,
  location: {
    name: string,
    address: string,
    city: string,
    country: string,
    latitude?: number,      # ✅ IMPLEMENTADO EN FE - Coordenada para mapa
    longitude?: number      # ✅ IMPLEMENTADO EN FE - Coordenada para mapa
  },
  minAge?: number,         # Edad mínima (para mostrar en búsqueda)
  category?: string,       # Categoría del evento
  tags?: string[],         # Tags para búsqueda
  maxTicketsPerUser?: number,  # Límite por compra
  salesStartDate?: string, # Cuándo inicia la venta
  salesEndDate?: string,   # Cuándo termina la venta
  isPublic?: boolean       # Visible en búsquedas
}
```

#### 4.3.3 `SaleLightDTO` - Datos para Validación

```yaml
# Actual
{ id, firstName, lastName, email, ticketType, price, validated }

# Sugerido
{
  ...existing,
  purchaseDate: string,    # Fecha de compra
  paymentStatus: string,   # Estado del pago
  ticketCode: string,      # Código único para QR
  validatedAt?: string,    # Cuándo se validó
  validatedBy?: string     # Quién validó
}
```

#### 4.3.4 `SearchResponse` - Más Información

```yaml
# Actual
{ events, hasEventsInYourCity, totalPages, currentPage, pageSize }

# Sugerido
{
  ...existing,
  filters: {
    countries: string[],   # Países disponibles
    cities: string[],      # Ciudades con eventos
    categories: string[],  # Categorías disponibles
    priceRange: { min, max }
  },
  featuredEvents?: Event[] # Eventos destacados para el país
}
```

### 4.4 Matriz de Dependencias BE-FE

```
Funcionalidad FE              →  Endpoint BE Requerido
─────────────────────────────────────────────────────────
Forgot Password               →  POST /auth/forgot-password ❌
Reset Password                →  POST /auth/reset-password ❌
MercadoPago Checkout          →  POST /checkout/process-payment ❌
Ver mis tickets               →  GET /tickets/{id} ❌
Reenviar tickets              →  POST /resend-tickets ❌
Dashboard métricas            →  GET /stats/seller ❌
Reportes de ventas            →  GET /reports/sales ❌
Exportar Excel                →  GET /reports/sales/export ❌
Gestionar vendedores          →  GET/POST /vendors ❌
Crear cupones                 →  POST /coupons ❌
Validar cupón en checkout     →  POST /validate-coupon ❌
Ver balance/ganancias         →  GET /finance/balance ❌
Solicitar retiro              →  POST /finance/withdrawal ❌
```

---

## 5. Plan de Acción Paso a Paso

### 5.1 Priorización de Tareas

```
P0 - Bloqueantes (sin esto no hay MVP)
P1 - Críticas (funcionalidad core)
P2 - Importantes (mejora significativa)
P3 - Deseables (nice to have)
```

### 5.2 Fase 1: Mocks Robustos + Estabilización (Semana 1-2)

> 🎯 **OBJETIVO**: El frontend funciona al 100% con datos simulados. No dependemos del backend.

#### P0 - Críticos (Sin esto no avanzamos)

| ID | Tarea | Tipo | Esfuerzo | Dependencia BE |
|----|-------|------|----------|----------------|
| F1-001 | **Implementar GlobalErrorBoundary** | Nueva | 4h | ❌ No |
| F1-002 | **Robustecer sistema de mocks** (todos los services) | Refactor | 1d | ❌ No |
| F1-003 | **Simular flujo completo de pago** (sin MercadoPago real) | Nueva | 1d | ❌ No |
| F1-004 | **Arreglar regex de validación email** en checkout | Bug Fix | 1h | ❌ No |
| F1-005 | **Agregar MockModeIndicator** en desarrollo | Nueva | 2h | ❌ No |

#### P1 - Importantes

| ID | Tarea | Tipo | Esfuerzo | Estado |
|----|-------|------|----------|--------|
| F1-006 | Eliminar duplicación ValidatorService/SalesService | Refactor | 2h | ✅ COMPLETADO |
| F1-007 | Mover constantes hardcodeadas a config | Refactor | 4h | ✅ COMPLETADO |
| F1-008 | Mejorar manejo de errores HTTP (HttpError → UI) | Refactor | 4h | ✅ COMPLETADO |
| F1-009 | Mock de tickets digitales (visualización) | Nueva | 4h | ⏭️ Omitido (usar BE) |
| F1-010 | Mock de estadísticas del dashboard | Nueva | 4h | ⏭️ Omitido (usar BE) |

### 5.3 Fase 2: Mejoras de UX y Hooks (Semana 3-4)

> 🎯 **OBJETIVO**: UI pulida, custom hooks para lógica compleja, mejor experiencia de usuario.

| ID | Tarea | Tipo | Esfuerzo | Estado |
|----|-------|------|----------|--------|
| F2-001 | Crear hook `useCheckoutFlow` (encapsula todo el checkout) | Nueva | 1d | ✅ COMPLETADO |
| F2-002 | Crear hook `useEventSearch` con debounce | Nueva | 4h | ✅ COMPLETADO |
| F2-003 | Crear hook `useTicketValidation` para QR/manual | Nueva | 4h | ✅ COMPLETADO |
| F2-004 | Mejorar loading states con Skeletons | UX | 1d | ✅ COMPLETADO |
| F2-005 | Implementar notificaciones toast globales (Snackbar) | UX | 4h | ✅ Ya existía |
| F2-006 | Responsive: mejorar mobile en checkout y backoffice | UX | 1d | ⏭️ Omitido |
| F2-007 | Agregar animaciones de transición entre páginas | UX | 4h | ⏭️ Omitido |

### 5.4 Fase 3: Funcionalidades Seller con Mocks (Semana 5-6)

> 🎯 **OBJETIVO**: Backoffice del organizador 100% funcional (con datos simulados si BE no está listo).

| ID | Tarea | Tipo | Esfuerzo | Estado |
|----|-------|------|----------|--------|
| F3-001 | Dashboard con métricas (mock o real según disponibilidad) | Nueva | 2d | ⏭️ Omitido (futura) |
| F3-002 | Gráficos de ventas (SalesCharts) con datos mock | Nueva | 2d | ⏭️ Omitido (futura) |
| F3-003 | **Implementar escáner QR web** (html5-qrcode) | Nueva | 2d | 🔄 PENDIENTE |
| F3-004 | Exportar lista de asistentes a Excel (frontend) | Nueva | 1d | ✅ COMPLETADO |
| F3-005 | Habilitar PROFILE | Nueva | 1d | 🔄 EN PROGRESO |
| F3-006 | Crear flujo de organizador (POST /organizer o mock) | Nueva | 1d | ⏭️ Omitido (futura) |

### 5.5 Fase 4: Integraciones Reales con Backend (Semana 7-8)

> 🎯 **OBJETIVO**: Conectar con APIs reales del backend. **Solo cuando los endpoints existan.**

| ID | Tarea | Tipo | Esfuerzo | Dependencia BE |
|----|-------|------|----------|----------------|
| F4-001 | **Integración real MercadoPago** (process-payment) | Integración | 2d | ✅ **Sí - CRÍTICO** |
| F4-002 | **Webhook handler** de MercadoPago | Integración | 1d | ✅ **Sí** |
| F4-003 | **Tickets reales** (GET /tickets/{id}) | Integración | 1d | ✅ **Sí** |
| F4-004 | **Estadísticas reales** (GET /stats/seller) | Integración | 1d | ✅ **Sí** |
| F4-005 | **Reportes reales** (GET /reports/sales) | Integración | 1d | ✅ **Sí** |
| F4-006 | Reenviar tickets por email | Integración | 4h | ✅ **Sí** |

### 5.6 Fase 5: Admin + Polish (Semana 9-10)

> 🎯 **OBJETIVO**: Completar funcionalidades admin y pulir la aplicación.

| ID | Tarea | Tipo | Esfuerzo | Dependencia BE |
|----|-------|------|----------|----------------|
| F5-001 | Habilitar gestión de vendedores (USERS) | Nueva | 2d | 🟡 Si endpoint existe |
| F5-002 | Crear página de SETTINGS | Nueva | 1d | 🟡 Opcional |
| F5-003 | Implementar forgot/reset password | Nueva | 1d | ✅ Sí |
| F5-004 | Landing page de captación organizadores | Nueva | 2d | ❌ No |
| F5-005 | SEO y meta tags dinámicos | SEO | 1d | ❌ No |
| F5-006 | PWA básico (manifest + service worker) | Nueva | 1d | ❌ No |
| F5-007 | Implementar cupones en checkout | Nueva | 1d | 🟡 Si endpoint existe |

### 5.7 Cronograma Visual

```
Semana 1-2: ████████ Fase 1 - Mocks Robustos + Estabilización
Semana 3-4: ████████ Fase 2 - UX + Custom Hooks
Semana 5-6: ████████ Fase 3 - Features Seller (con mocks)
Semana 7-8: ████████ Fase 4 - Integraciones Reales (BE)
Semana 9-10: ████████ Fase 5 - Admin + Polish

Hitos:
├─ S2: ✓ Frontend funciona 100% con mocks (sin depender de BE)
├─ S4: ✓ UX pulida, hooks reutilizables
├─ S6: ✓ Dashboard Seller completo (mock o real)
├─ S8: ✓ MercadoPago + Tickets reales funcionando
└─ S10: ✓ MVP listo para producción
```

### 5.8 Flujo de Trabajo: Mock → Real

```
                    ┌─────────────────────────────────────────┐
                    │         DESARROLLO PARALELO             │
                    └─────────────────────────────────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        │                              │                              │
        ▼                              ▼                              ▼
┌───────────────┐            ┌───────────────┐            ┌───────────────┐
│   FRONTEND    │            │   BACKEND     │            │   TESTING     │
│  (con mocks)  │            │  (endpoints)  │            │  (E2E later)  │
└───────┬───────┘            └───────┬───────┘            └───────────────┘
        │                            │
        │  Semana 1-6                │  Semana 1-8
        │  ───────────               │  ───────────
        │  • UI completa             │  • Implementar endpoints
        │  • Flujos simulados        │  • MercadoPago integration
        │  • Error handling          │  • Tickets + Stats
        │                            │
        └────────────┬───────────────┘
                     │
                     ▼ Semana 7-8
            ┌───────────────┐
            │  INTEGRACIÓN  │
            │  Mock → API   │
            └───────────────┘
                     │
                     ▼
            ┌───────────────┐
            │   MVP LISTO   │
            └───────────────┘
```

### 5.9 Requisitos para el Equipo de Backend

> 📌 **IMPORTANTE**: El frontend NO está bloqueado. Trabajamos con mocks hasta que los endpoints existan.

#### Timeline Recomendado para Backend:

| Semana | Prioridad | Endpoints Necesarios |
|--------|-----------|----------------------|
| **1-4** | 🔴 Crítico | `POST /checkout/process-payment` (MercadoPago) |
| **1-4** | 🔴 Crítico | `POST /webhooks/mercadopago` |
| **3-5** | 🟡 Alto | `GET /tickets/{ticketId}` |
| **3-5** | 🟡 Alto | `GET /checkout/session/{id}/tickets` |
| **5-6** | 🟡 Alto | `GET /stats/seller` |
| **5-6** | 🟢 Medio | `GET /stats/global` |
| **6-7** | 🟢 Medio | `GET /reports/sales` + export |
| **7-8** | 🟢 Medio | CRUD vendedores, cupones |
| **8+** | ⚪ Bajo | Finanzas, retiros, emails |

#### Comunicación Frontend ↔ Backend:

```
Cuando el BE termine un endpoint:
1. Notificar al equipo FE
2. FE cambia: ConfigService.isMockedEnabled() → false para ese servicio
3. Testear integración
4. Si funciona → merge
5. Si falla → revertir a mock, reportar bug
```

---

## 6. Anexos

### 6.1 Checklist de Lanzamiento MVP

#### Infraestructura (Obligatorio antes de cualquier deploy)
- [ ] ✅ **GlobalErrorBoundary** implementado y funcionando
- [ ] ✅ **MockModeIndicator** visible solo en desarrollo
- [ ] ✅ Sistema de mocks robusto para todos los servicios
- [ ] ✅ Error handling HTTP → UI amigable

#### Flujo de Compra
- [ ] Checkout con MercadoPago funciona end-to-end (o simulado)
- [ ] Tickets se generan y pueden visualizarse
- [ ] Tickets se pueden reenviar por email
- [ ] Manejo de entradas gratuitas
- [ ] Manejo de entradas de pago

#### Backoffice Organizador
- [ ] Organizador puede crear/editar eventos
- [ ] Organizador puede ver ventas de sus eventos
- [ ] Organizador puede validar entradas (manual y QR)
- [ ] Dashboard muestra métricas (mock o reales)

#### General
- [ ] Admin puede ver todos los eventos
- [ ] Sistema soporta CO y AR
- [ ] Loading states en toda la app
- [ ] Mobile responsive
- [ ] Sin errores en consola (producción)

### 6.2 Métricas de Éxito

| Métrica | Target MVP | Cómo medir |
|---------|------------|------------|
| Tiempo de checkout | < 3 min | Analytics |
| Tasa de abandono checkout | < 40% | Funnel |
| Errores en producción | < 1% requests | Logs |
| Tiempo de carga home | < 2s | Lighthouse |
| Core Web Vitals | Todos verdes | Lighthouse |

### 6.3 Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Retraso endpoints BE | Alta | Alto | Comunicación constante, mocks robustos |
| Integración MercadoPago | Media | Alto | Ambiente sandbox, testing exhaustivo |
| Problemas de escala | Baja | Medio | Lazy loading, paginación |
| Seguridad tokens | Media | Alto | Refresh tokens, HTTPS only |

### 6.4 Contactos y Recursos

- **Repo Frontend**: `https://github.com/alejandrojuarez675/ticketoffice-frontend-2`
- **Repo Backend**: `https://github.com/alejandrojuarez675/ticketoffice-backend`
- **MercadoPago Docs**: `https://www.mercadopago.com.ar/developers/`

---

> **Próximos pasos**: Una vez aprobado este roadmap, comenzar con la Fase 1 (Estabilización). El primer ticket debería ser la integración con MercadoPago (F1-001) ya que es el bloqueante principal.

---

*Documento generado como parte de la auditoría técnica del proyecto TicketOffice.*

