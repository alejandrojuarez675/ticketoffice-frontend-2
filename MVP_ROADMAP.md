# MVP ROADMAP - Plataforma de Ticketing (Colombia/Argentina)

> **Documento Maestro de Auditoría y Planificación**  
> Última actualización: 6 Enero 2026  
> Versión: 1.4 (Actualización completa del estado del proyecto)

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Definición de Arquitectura y Estándares](#2-definición-de-arquitectura-y-estándares)
3. [Análisis de Brechas (Gap Analysis)](#3-análisis-de-brechas-gap-analysis)
4. [Auditoría de Backend (Swagger/OpenAPI)](#4-auditoría-de-backend-swaggeropenapi)
5. [Plan de Acción Paso a Paso](#5-plan-de-acción-paso-a-paso)
6. [Anexos](#6-anexos)
7. [Próximos Pasos](#7-próximos-pasos)

---

## 1. Resumen Ejecutivo

### 1.1 Estado Actual del Proyecto

| Área                    | Estado          | Observaciones                                       |
| ----------------------- | --------------- | --------------------------------------------------- |
| **Infraestructura**     | ✅ Funcional    | Next.js 15, React 19, MUI 7, TypeScript             |
| **Autenticación**       | ✅ Funcional    | Login/Register funcionan con BE real                |
| **Regionalización**     | ✅ Funcional    | Sistema de países/ciudades con API real             |
| **Eventos Públicos**    | ✅ Funcional    | Búsqueda, detalle, filtros implementados            |
| **Checkout/Compra**     | ✅ Funcional    | Formulario y API de compra funcionan                |
| **QR Codes Tickets**    | ✅ Funcional    | Visualización de QR desde API en congrats           |
| **Backoffice Seller**   | ✅ Funcional    | CRUD eventos completo con BE real                   |
| **Backoffice Admin**    | 🟡 Parcial      | Usuarios/reportes deshabilitados por flags          |
| **Validación Entradas** | 🟡 Parcial      | Manual funciona, QR no implementado                 |
| **Tickets Digitales**   | 🔴 Pendiente BE | Requiere endpoint `GET /api/public/v1/tickets/{id}` |
| **MercadoPago**         | 🔴 Pendiente BE | Requiere endpoints de integración con MP            |
| **Forgot/Reset Pass**   | 🔴 Pendiente BE | Requiere endpoints de recuperación                  |

### 1.2 Stack Tecnológico

```
Frontend:
├── Next.js 15.5.7 (App Router + Turbopack)
├── React 19.1.0
├── TypeScript 5.5.4
├── Material UI 7.2.0
├── MUI X Data Grid 8.9.1
├── MUI X Date Pickers 8.9.0
├── React Hook Form 7.62 + Zod 4.0.17
├── date-fns 4.1.0
├── html5-qrcode 2.3.8 (escaneo QR)
├── react-qr-code 2.0.18 (generación QR)
└── TailwindCSS 3.4 (configurado, uso limitado)

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

| ❌ Evitar                | ✅ Preferir                        |
| ------------------------ | ---------------------------------- |
| Repositories para todo   | Services directos con tipos        |
| Use Cases formales       | Custom Hooks que encapsulan lógica |
| DTOs + Mappers separados | Transformación inline en Services  |
| Capas abstractas         | Código directo y legible           |

#### Estructura de Carpetas Actual:

```
src/
├── app/                       # App Router de Next.js (páginas)
│   ├── (public)/              # Home page pública
│   │   └── page.tsx           # Landing page con eventos destacados
│   ├── admin/                 # Backoffice (seller/admin)
│   │   ├── coupons/           # Gestión de cupones (deshabilitado)
│   │   ├── dashboard/         # Dashboard principal
│   │   ├── events/            # CRUD de eventos
│   │   │   ├── [id]/          # Detalle, edición, ventas
│   │   │   ├── new/           # Crear nuevo evento
│   │   │   └── validate/      # Validación por evento
│   │   ├── profile/           # Perfil del usuario
│   │   ├── settings/          # Configuración (deshabilitado)
│   │   ├── users/             # Gestión usuarios (deshabilitado)
│   │   └── validate/          # Validación global de entradas
│   ├── auth/                  # Autenticación
│   │   ├── forgot/            # Recuperar contraseña
│   │   ├── login/             # Inicio de sesión
│   │   ├── register/          # Registro
│   │   └── reset/             # Restablecer contraseña
│   ├── checkout/              # Flujo de compra
│   │   ├── [sessionId]/       # Formulario de compra
│   │   └── congrats/          # Página de confirmación
│   ├── contact/               # Página de contacto
│   ├── contexts/              # Contextos de la app
│   ├── events/                # Eventos públicos
│   │   ├── [id]/              # Detalle por ID
│   │   ├── [slug]/            # Detalle por slug SEO
│   │   ├── seller/            # Eventos del vendedor
│   │   └── page.tsx           # Búsqueda de eventos
│   ├── privacy/               # Política de privacidad
│   ├── terms/                 # Términos y condiciones
│   ├── tickets/               # Visualización de tickets
│   ├── globals.css            # Estilos globales
│   ├── layout.tsx             # Layout principal
│   └── not-found.tsx          # Página 404
│
├── components/                # Componentes React reutilizables
│   ├── ThemeProvider/         # Proveedor de tema MUI
│   ├── auth/                  # Componentes de autenticación
│   ├── common/                # Componentes genéricos
│   │   ├── CitySelect.tsx
│   │   ├── ClientProviders.tsx
│   │   ├── CountrySelect.tsx
│   │   ├── Empty.tsx
│   │   ├── ErrorState.tsx
│   │   ├── GlobalErrorBoundary.tsx
│   │   ├── HttpErrorAlert.tsx
│   │   ├── Loading.tsx
│   │   ├── LocationPicker.tsx
│   │   ├── MockModeIndicator.tsx
│   │   ├── QRScanner.tsx
│   │   ├── RegionSelectorModal.tsx
│   │   └── Skeletons.tsx
│   ├── events/                # Componentes de eventos
│   │   ├── AppliedFiltersChips.tsx
│   │   ├── EventCard.tsx
│   │   ├── EventsSearchBar.tsx
│   │   ├── FeaturedEvents.tsx
│   │   ├── FiltersPanel.tsx
│   │   └── RelatedEvents.tsx
│   ├── forms/                 # Componentes de formularios
│   │   ├── PasswordField.tsx
│   │   ├── PasswordStrengthBar.tsx
│   │   ├── SnackbarProvider.tsx
│   │   └── SubmitButton.tsx
│   ├── layouts/               # Layouts
│   │   ├── BackofficeBreadcrumbs.tsx
│   │   ├── BackofficeLayout.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LightLayout.tsx
│   │   ├── SalesCharts.tsx
│   │   └── SoftAnimatedBackground.tsx
│   └── navigation/            # Navegación
│       ├── AdminSidebar.tsx
│       ├── AdminTopBar.tsx
│       ├── Footer.tsx
│       └── Navbar.tsx
│
├── services/                  # 🔑 SERVICIOS (lógica de negocio + API)
│   ├── AuthService.ts         # Autenticación completa
│   ├── CheckoutService.ts     # Flujo de compra
│   ├── ConfigService.ts       # Configuración y entorno
│   ├── CouponService.ts       # Cupones (mock)
│   ├── EventService.ts        # CRUD eventos
│   ├── MercadoPagoApi.ts      # Integración MercadoPago
│   ├── OrganizerService.ts    # Datos del organizador
│   ├── RegionService.ts       # Regionalización
│   ├── ReportService.ts       # Reportes (mock)
│   ├── SalesService.ts        # Ventas y validación
│   ├── StatsService.ts        # Estadísticas (mock)
│   ├── TicketService.ts       # Tickets digitales (mock)
│   ├── VendorService.ts       # Vendedores (mock)
│   └── schemas/               # Validaciones Zod
│       ├── checkout.ts
│       ├── event.ts
│       └── sales.ts
│
├── hooks/                     # 🔑 CUSTOM HOOKS (lógica de UI)
│   ├── useAuth.ts             # Estado de autenticación
│   ├── useCheckoutFlow.ts     # Flujo completo de compra
│   ├── useDebouncedValue.ts   # Utilidad de debounce
│   ├── useEventSearch.ts      # Búsqueda con debounce
│   ├── useFeatureFlags.tsx    # Flags de características
│   ├── usePermissions.ts      # Sistema de permisos
│   ├── useRegionalFormat.ts   # Formateo regional
│   └── useTicketValidation.ts # Validación de entradas
│
├── mocks/                     # 🔑 DATOS SIMULADOS
│   ├── data/
│   │   ├── checkout.ts        # Sesiones mock
│   │   ├── events.ts          # Eventos mock
│   │   ├── sales.ts           # Ventas mock
│   │   └── users.ts           # Usuarios mock
│   └── index.ts               # Exportaciones centralizadas
│
├── lib/                       # Utilidades de bajo nivel
│   ├── http.ts                # Cliente HTTP con interceptores
│   ├── logger.ts              # Sistema de logging
│   └── permissions.ts         # Sistema de permisos
│
├── config/                    # Configuración
│   ├── backofficeNav.ts       # Navegación del backoffice
│   └── featureFlags.ts        # Feature toggles
│
├── constants/                 # 🆕 CONSTANTES CENTRALIZADAS
│   ├── countries.ts           # Lista de países
│   ├── currencies.ts          # Monedas disponibles
│   ├── documents.ts           # Tipos de documentos
│   ├── eventTags.ts           # Tags de eventos
│   └── index.ts               # Exportación centralizada
│
├── contexts/                  # Contextos React
│   └── RegionContext.tsx      # Contexto de regionalización
│
├── theme/                     # Tema de MUI
│
├── types/                     # Tipos TypeScript globales
│   ├── Event.ts               # Tipos de eventos
│   ├── Sales.ts               # Tipos de ventas
│   ├── checkout.ts            # Tipos de checkout
│   ├── contract.ts            # Tipos de contratos
│   ├── html5-qrcode.d.ts      # Declaraciones QR
│   ├── search-event.ts        # Tipos de búsqueda
│   └── user.ts                # Tipos de usuario
│
└── utils/                     # Funciones utilitarias
    ├── date.ts                # Manejo de fechas
    ├── eventsFilters.ts       # Filtros de eventos
    ├── exportExcel.ts         # Exportación a Excel
    ├── favorites.ts           # LocalStorage helpers
    ├── format.ts              # Formateo de moneda, fechas
    ├── password.ts            # Validación de contraseñas
    └── sanitize.ts            # Sanitización de datos
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

    const raw = await http.get<unknown>(
      `${this.BASE_URL}/api/public/v1/event/${id}`
    );
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
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submitPurchase = useCallback(
    async (buyerData: BuyerData[]) => {
      setState("loading");
      setError(null);

      try {
        // Simular pago (MVP) o llamar API real
        if (ConfigService.isMockedEnabled()) {
          await mockProcessPayment(sessionId);
        } else {
          await CheckoutService.buy(sessionId, {
            mainEmail: buyerData[0].email,
            buyer: buyerData,
          });
        }

        setState("success");
        router.push(`/checkout/congrats?sessionId=${sessionId}`);
      } catch (e) {
        setState("error");
        setError(e instanceof Error ? e.message : "Error al procesar el pago");
      }
    },
    [sessionId, router]
  );

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
import { z } from "zod";

export const EventDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string().transform((d) => new Date(d).toISOString()), // Transformación inline
  location: z.object({
    name: z.string(),
    address: z.string(),
    city: z.string(),
    country: z.string(),
  }),
  tickets: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      value: z.number(),
      stock: z.number(),
      isFree: z.boolean(),
    })
  ),
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
"use client";

import { Component, ReactNode } from "react";
import { Box, Button, Typography, Container } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

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
        <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
          <ErrorOutlineIcon sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            ¡Algo salió mal!
          </Typography>
          <Typography color="text.secondary" paragraph>
            Ha ocurrido un error inesperado. Por favor, intenta nuevamente.
          </Typography>
          <Box
            sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "center" }}
          >
            <Button variant="contained" onClick={this.handleRetry}>
              Reintentar
            </Button>
            <Button variant="outlined" href="/">
              Ir al inicio
            </Button>
          </Box>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <Box
              sx={{
                mt: 4,
                p: 2,
                bgcolor: "grey.100",
                borderRadius: 1,
                textAlign: "left",
              }}
            >
              <Typography
                variant="caption"
                component="pre"
                sx={{ whiteSpace: "pre-wrap" }}
              >
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
    if (process.env.NODE_ENV === "production") {
      return false; // ← Nunca mocks en producción
    }
    const v = (process.env.NEXT_PUBLIC_USE_MOCKS || "true").toLowerCase();
    return v === "true" || v === "1";
  }
}
```

#### 2.3.2 Estructura de Mocks

```typescript
// mocks/data/events.ts
export const MOCK_EVENTS: EventDetail[] = [
  {
    id: "evt-001",
    title: "Concierto de Trueno",
    date: "2025-06-07T20:00:00",
    location: {
      name: "Movistar Arena",
      city: "Bogotá",
      country: "Colombia",
      address: "Calle 123",
    },
    tickets: [
      {
        id: "t1",
        type: "General",
        value: 150000,
        currency: "COP",
        isFree: false,
        stock: 100,
      },
      {
        id: "t2",
        type: "VIP",
        value: 350000,
        currency: "COP",
        isFree: false,
        stock: 20,
      },
    ],
    // ...
  },
  // más eventos...
];

// Funciones de mock que simulan latencia
export async function mockGetEventById(id: string): Promise<EventDetail> {
  await delay(300); // Simular latencia de red
  const event = MOCK_EVENTS.find((e) => e.id === id);
  if (!event) throw new Error("Evento no encontrado");
  return event;
}

export async function mockSearchEvents(
  params: SearchParams
): Promise<SearchResponse> {
  await delay(400);
  let filtered = [...MOCK_EVENTS];
  if (params.country && params.country !== "all") {
    filtered = filtered.filter((e) => e.location.country === params.country);
  }
  if (params.query) {
    filtered = filtered.filter((e) =>
      e.title.toLowerCase().includes(params.query!.toLowerCase())
    );
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
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

#### 2.3.3 Mock de MercadoPago (Simulación de Pago)

```typescript
// mocks/data/checkout.ts
export async function mockProcessPayment(
  sessionId: string
): Promise<{ success: boolean; redirectUrl: string }> {
  await delay(2000); // Simular procesamiento de pago

  // 90% de probabilidad de éxito para testing
  const success = Math.random() > 0.1;

  if (!success) {
    throw new Error("Pago rechazado (simulación)");
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
  static async processPayment(
    sessionId: string
  ): Promise<ProcessPaymentResponse> {
    // 🔑 Mock primero, API después
    if (ConfigService.isMockedEnabled()) {
      return mockProcessPayment(sessionId);
    }

    // API real (cuando el endpoint exista)
    return http.post<ProcessPaymentResponse>(
      `${this.BASE_URL}/api/public/v1/checkout/session/${sessionId}/process-payment`,
      {
        returnUrls: {
          success: "/checkout/congrats",
          failure: "/checkout",
          pending: "/checkout",
        },
      }
    );
  }
}
```

#### 2.3.5 Indicador Visual de Mock Mode (Solo Desarrollo)

```typescript
// components/common/MockModeIndicator.tsx
"use client";

import { Chip, Box } from "@mui/material";
import { ConfigService } from "@/services/ConfigService";

export function MockModeIndicator() {
  if (process.env.NODE_ENV === "production") return null;
  if (!ConfigService.isMockedEnabled()) return null;

  return (
    <Box sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 9999 }}>
      <Chip
        label="🧪 MOCK MODE"
        color="warning"
        size="small"
        sx={{ fontWeight: "bold" }}
      />
    </Box>
  );
}
```

### 2.4 Principios SOLID (Aplicación Pragmática)

| Principio                 | Aplicación Pragmática en MVP                                                                             |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **S**ingle Responsibility | Cada Service maneja un dominio (eventos, auth, checkout). Cada Hook encapsula una funcionalidad de UI.   |
| **O**pen/Closed           | Services abiertos a extensión via mocks (`if (isMocked) { ... }`). No necesitamos interfaces abstractas. |
| **L**iskov Substitution   | Mock functions son intercambiables con API calls (misma firma).                                          |
| **I**nterface Segregation | Tipos TypeScript pequeños y específicos (`EventDetail`, `EventForList`).                                 |
| **D**ependency Inversion  | ConfigService decide si usar mock o API. El código de negocio no sabe cuál se usa.                       |

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
    this.name = "EventNotFoundError";
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
import { GlobalErrorBoundary } from "@/components/common/GlobalErrorBoundary";
import { MockModeIndicator } from "@/components/common/MockModeIndicator";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

### 2.8 Sistema de Slugs SEO-Friendly (Nuevo en v1.3)

> 🔗 **IMPORTANTE**: Las URLs de eventos ahora usan slugs amigables para SEO en lugar de IDs crudos.

El sistema de slugs permite URLs más legibles y mejores para SEO mientras mantiene la unicidad mediante el ID del evento.

#### 2.8.1 Formato de Slugs

```
Formato: {titulo-normalizado}-{id-corto}
Ejemplo: concierto-de-rock-2025-3351d67b
         └─────┬─────┘ └──┬──┘
           título      primeros 8 chars del ID
```

#### 2.8.2 Utilidades de Slugs

```typescript
// src/utils/slug.ts

// Genera slug desde título
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
    .replace(/[^a-z0-9]+/g, "-") // Reemplazar espaciales
    .replace(/-+/g, "-") // Sin guiones múltiples
    .replace(/^-|-$/g, ""); // Sin guiones en extremos
}

// Combina título + ID para slug único
export function generateEventSlug(title: string, id: string): string {
  const titleSlug = generateSlug(title);
  const shortId = id.substring(0, 8);
  return `${titleSlug}-${shortId}`;
}

// Extrae ID desde slug
export function extractIdFromSlug(slug: string): string | null {
  const parts = slug.split("-");
  if (parts.length < 2) return null;
  return parts[parts.length - 1]; // Último segmento = ID
}
```

#### 2.8.3 Migración de Rutas

**Antes (v1.2)**:

```
/events/3351d67b-2b50-4d6c-9681-1fb79440a078
```

**Después (v1.3)**:

```
/events/concierto-de-trueno-movistar-arena-3351d67b
```

#### 2.8.4 Componentes Actualizados

```typescript
// EventCard.tsx, FeaturedEvents.tsx
import { generateEventSlug } from "@/utils/slug";

const eventSlug = generateEventSlug(event.name, event.id);
router.push(`/events/${eventSlug}`);
```

```typescript
// /events/[slug]/page.tsx
const { slug } = useParams<{ slug: string }>();
const id = extractIdFromSlug(slug);
const eventData = await EventService.getPublicById(id);
```

#### 2.8.5 Beneficios

- ✅ **SEO**: URLs descriptivas mejoran indexación en buscadores
- ✅ **UX**: Enlaces más legibles y compartibles
- ✅ **Unicidad**: ID al final garantiza URLs únicas
- ✅ **Compatibilidad**: Extracción de ID mantiene lógica de backend

#### 2.8.6 Consideraciones

- El backend sigue usando IDs, solo el frontend usa slugs
- Los slugs NO se guardan en base de datos
- Se generan dinámicamente desde `name` + `id`
- URLs antiguas con ID directo ya no funcionarán (requiere migración manual si hay URLs compartidas)

---

### 2.9 Sistema de Regionalización (v1.2)

> 🌍 **IMPORTANTE**: La configuración regional NO limita qué eventos puede ver el usuario. Solo afecta CÓMO se muestran los datos.

El sistema de regionalización permite personalizar la experiencia del usuario según su país/ciudad sin restringir el acceso a eventos de otras regiones.

#### 2.8.1 Arquitectura del Sistema

```
RegionContext (Estado global)
    ↓
RegionProvider (Wrapper de la app)
    ↓
RegionSelectorModal (UI de selección)
    ↓
RegionService (API + LocalStorage)
```

#### 2.8.2 Características Principales

**1. Carga No-Bloqueante**

- El contexto NO bloquea el renderizado inicial
- La configuración se carga de forma asíncrona
- El usuario puede navegar sin configurar región

**2. Persistencia Inteligente**

- Configuración guardada en localStorage
- Cache de 24 horas
- Validación automática de expiración

**3. Renderizado Condicional**

- El modal solo se renderiza si es necesario
- `forceSelection=false` por defecto en ClientProviders
- Mejora significativa en tiempo de carga inicial

**4. Integración con API Real**

```typescript
// Endpoints utilizados:
GET / api / public / v1 / form / country; // Lista de países
GET / api / public / v1 / form / country / { id } / config; // Config de país (ciudades, monedas, docs)
```

#### 2.8.3 Optimizaciones Realizadas (Dic 29, 2025)

| Problema Anterior                             | Solución Implementada                                               |
| --------------------------------------------- | ------------------------------------------------------------------- | --- | --------------- |
| Modal se renderizaba siempre (incluso oculto) | Renderizado condicional: solo si `showModal                         |     | forceSelection` |
| `useEffect` bloqueaba renderizado inicial     | Wrapped en `try-catch-finally` con `setIsLoading(false)` en finally |
| Estimación de país causaba delays             | Movido a `setTimeout` para ejecución asíncrona                      |
| Carga de config bloqueaba lista de países     | Cambiado a `loadCountryConfig().catch()` sin await                  |
| Tipo `null` incompatible con `undefined`      | Corregido: `finalCurrencyCode                                       |     | undefined`      |

#### 2.8.4 Uso en Componentes

```typescript
// Acceder a la configuración regional
import { useRegion } from "@/contexts/RegionContext";

function MyComponent() {
  const { countryCode, countryConfig, isConfigured, openRegionSelector } =
    useRegion();

  if (!isConfigured) {
    return <Button onClick={openRegionSelector}>Seleccionar país</Button>;
  }

  const currency = countryConfig?.availableCurrencies[0];
  return <div>Moneda: {currency?.symbol}</div>;
}
```

#### 2.8.5 Estados del Sistema

```typescript
type RegionState =
  | "loading" // Cargando configuración guardada
  | "not-configured" // Sin configuración (navegación libre)
  | "configured" // Con configuración válida
  | "expired"; // Configuración expirada (recargando)
```

#### 2.8.6 Datos que Afecta la Regionalización

- ✅ **SÍ afecta**: Formato de precios, zona horaria, opciones de documentos en formularios
- ❌ **NO afecta**: Qué eventos se muestran, búsqueda, filtros

#### 2.8.7 Testing

```bash
# Probar sin configuración regional
localStorage.clear();
window.location.reload();

# Probar con país específico
import { RegionService } from '@/services/RegionService';
const config = await RegionService.getCountryConfig('AR');
RegionService.saveRegionalConfig('AR', config);
```

---

## 3. Análisis de Brechas (Gap Analysis)

### 3.1 Estado de Servicios Frontend vs Requerimientos MVP

| Servicio           | Estado       | Integrado BE                 | Mock | Observaciones                                   |
| ------------------ | ------------ | ---------------------------- | ---- | ----------------------------------------------- |
| `AuthService`      | 🟡 Parcial   | ✅ login/register/me         | ✅   | Falta: forgot/reset password, verifyEmail       |
| `EventService`     | ✅ Completo  | ✅ Todos                     | ✅   | CRUD + Search funcionando                       |
| `CheckoutService`  | 🟡 Parcial   | ✅ createSession, buy        | ✅   | Falta: processPayment (MercadoPago)             |
| `ConfigService`    | ✅ Completo  | N/A                          | N/A  | Configuración de entorno y mocks                |
| `RegionService`    | ✅ Completo  | ✅ countries, config         | ✅   | Regionalización completa                        |
| `SalesService`     | ✅ Funcional | ✅ listByEvent, validateSale | ✅   | Validación unificada (eliminó ValidatorService) |
| `OrganizerService` | 🟡 Parcial   | ✅ getOrganizer              | ❌   | Datos del organizador actual                    |
| `MercadoPagoApi`   | 🔴 Pendiente | ❌                           | ✅   | Requiere endpoints BE de MercadoPago            |
| `TicketService`    | 🔴 Solo Mock | ❌                           | ✅   | No hay endpoint público de tickets en BE        |
| `StatsService`     | 🔴 Solo Mock | ❌                           | ✅   | No existen endpoints de estadísticas            |
| `CouponService`    | 🔴 Solo Mock | ❌                           | ✅   | No existen endpoints de cupones                 |
| `VendorService`    | 🔴 Solo Mock | ❌                           | ✅   | No existen endpoints de vendedores              |
| `ReportService`    | 🔴 Solo Mock | ❌                           | ✅   | No existen endpoints de reportes                |

### 3.2 Bugs y Problemas Identificados

#### 3.2.1 Bugs Críticos

| ID      | Archivo             | Descripción                                       | Impacto                               |
| ------- | ------------------- | ------------------------------------------------- | ------------------------------------- |
| BUG-001 | `MercadoPagoApi.ts` | Integración MercadoPago pendiente de endpoints BE | 🔴 Bloqueante - Pagos no funcionan    |
| BUG-002 | `AuthService.ts`    | forgot/reset password sin endpoints BE            | 🟡 Recuperación de cuenta no funciona |
| BUG-003 | `TicketService.ts`  | Solo mock, no hay endpoint público de tickets     | 🟡 No se pueden ver tickets comprados |

#### 3.2.2 Deuda Técnica

| ID       | Tipo          | Ubicación                | Descripción                                                |
| -------- | ------------- | ------------------------ | ---------------------------------------------------------- |
| DEBT-001 | ✅ Resuelto   | `ValidatorService`       | Eliminado - lógica unificada en SalesService               |
| DEBT-002 | ✅ Resuelto   | `constants/countries.ts` | Países centralizados en constantes                         |
| DEBT-003 | Type Safety   | `EventService.ts`        | Normalización robusta con helpers tipo-safe                |
| DEBT-004 | Mock Data     | Múltiples servicios      | Datos mock separados en `/mocks/data/`                     |
| DEBT-005 | Feature Flags | `featureFlags.ts`        | 4 de 9 features deshabilitadas                             |
| DEBT-006 | ✅ Resuelto   | `EventService.ts`        | Función `dateArrayToIso()` normaliza fechas                |
| DEBT-007 | Storage       | Checkout flow            | Session meta en localStorage (diseño intencional para MVP) |

#### 3.2.3 Datos Hardcodeados y Constantes

```typescript
// ✅ RESUELTO: Constantes centralizadas en src/constants/
import { COUNTRIES, DOCUMENT_TYPES, CURRENCIES } from "@/constants";

// ✅ RESUELTO: Mocks separados en src/mocks/data/
import { mockGetEvents, mockSearchEvents } from "@/mocks";

// 🟡 PENDIENTE: Features de landing page en src/app/(public)/page.tsx
// Considerar mover a constantes o CMS en el futuro
```

### 3.3 Análisis de Feature Flags

```typescript
// src/config/featureFlags.ts - Estado actual (6 Enero 2026)
export const FEATURES: FeatureFlags = {
  // MVP ON ✅ - Funcionalidades activas
  DASHBOARD: true, // Dashboard del backoffice
  EVENTS: true, // CRUD de eventos
  VALIDATE: true, // Validación de entradas
  TICKETS: true, // Vista de tickets y QR
  PROFILE: true, // Perfil del usuario (redirige después del registro)

  // MVP OFF ❌ - Requieren desarrollo adicional
  REPORTS: false, // Falta: Endpoints de estadísticas en BE
  USERS: false, // Falta: Endpoints de gestión de vendedores
  SETTINGS: false, // Falta: Configuración de cuenta
  COUPONS: false, // Falta: Endpoints de cupones en BE
};
```

### 3.4 Cobertura de Funcionalidades MVP

#### Experiencia del Comprador (Buyer)

| Funcionalidad               | Estado | Notas                          |
| --------------------------- | ------ | ------------------------------ |
| Home con eventos destacados | ✅     | Funciona con CO + AR           |
| Búsqueda de eventos         | ✅     | Por país, ciudad, query        |
| Detalle de evento           | ✅     | Con tipos de tickets           |
| Selección de tickets        | ✅     | Cantidad, precio               |
| Checkout formulario         | ✅     | Datos de compradores           |
| Integración MercadoPago     | 🔴     | **NO FUNCIONA**                |
| Página de éxito             | 🟡     | Existe pero sin tickets reales |
| Visualización de boletas    | 🔴     | Solo mock                      |
| Recuperación por email      | 🔴     | No implementado                |

#### Experiencia del Organizador (Seller)

| Funcionalidad           | Estado | Notas                       |
| ----------------------- | ------ | --------------------------- |
| Registro de organizador | ✅     | Básico, sin perfil completo |
| Dashboard               | 🟡     | Métricas hardcodeadas       |
| Crear evento            | ✅     | CRUD completo               |
| Editar evento           | ✅     | Funcional                   |
| Ver ventas              | ✅     | Lista de ventas por evento  |
| Validar entrada manual  | ✅     | Por ID de venta             |
| Validar entrada QR      | 🔴     | "En desarrollo"             |
| Estadísticas            | 🔴     | Solo mock                   |
| Solicitud retiro dinero | 🔴     | No existe                   |

#### Administración (Admin)

| Funcionalidad         | Estado | Notas                  |
| --------------------- | ------ | ---------------------- |
| Ver todos los eventos | 🟡     | Mismo que seller       |
| Gestionar vendedores  | 🔴     | Deshabilitado por flag |
| Configuración global  | 🔴     | Deshabilitado por flag |
| Reportes globales     | 🔴     | Deshabilitado por flag |

---

## 7. Próximos Pasos

> 📋 **Sección reservada para planificación de próximas iteraciones**
>
> Esta sección será completada con las tareas priorizadas para las próximas sprints.

### 7.1 Prioridad Alta (Crítico para MVP)

<!-- TODO: Agregar tareas críticas aquí -->

### 7.2 Prioridad Media (Mejoras importantes)

<!-- TODO: Agregar mejoras importantes aquí -->

### 7.3 Prioridad Baja (Nice to have)

<!-- TODO: Agregar mejoras opcionales aquí -->

### 7.4 Backlog Técnico

<!-- TODO: Agregar deuda técnica a resolver aquí -->

---
