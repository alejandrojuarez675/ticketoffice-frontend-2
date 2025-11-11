This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Environment Setup

Create a local environment file based on the following variables. You can also copy `env.example` to `.env.local` and adjust values.

Required variables:

- `NEXT_PUBLIC_API_URL` — Base URL of the backend API (e.g. `http://localhost:8080`).
- `NEXT_PUBLIC_USE_MOCK` — `true` to use frontend mocks, `false` to use the real API.

Example `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_USE_MOCK=true
```

Modes:

- Development with mocks: `NEXT_PUBLIC_USE_MOCK=true`.
- Staging: `NEXT_PUBLIC_USE_MOCK=false`, set `NEXT_PUBLIC_API_URL` to your staging backend.
- Production: `NEXT_PUBLIC_USE_MOCK=false`, set `NEXT_PUBLIC_API_URL` to your production backend.

Note: Mocks are controlled by `ConfigService.isMockedEnabled()` and affect services like `CheckoutService`, `EventService`, and `TicketService`.

## MercadoPago: Backend setup

This frontend expects the backend to create a MercadoPago preference and return a redirect URL. Implement these endpoints in your backend:

- POST `/api/public/v1/checkout/process-payment` with `{ sessionId }`
  - Creates the MP preference and returns `{ success: true, redirectUrl }` (use `init_point` or `sandbox_init_point`).
  - Set `back_urls`:
    - success: `https://<frontend>/checkout/congrats?sessionId=<SESSION_ID>`
    - failure: `https://<frontend>/checkout/<SESSION_ID>?status=failure`
    - pending: `https://<frontend>/checkout/<SESSION_ID>?status=pending`
  - Set `auto_return: "approved"`.

- POST `/api/public/v1/webhooks/mercadopago`
  - Validate payment and issue tickets linked to the `sessionId`.

Suggested backend env vars (example names):

```
MP_ACCESS_TOKEN=your_sandbox_or_prod_access_token
MP_WEBHOOK_SECRET=optional_signature_secret
FRONTEND_BASE_URL=https://localhost:3000
BACKEND_BASE_URL=http://localhost:8080
```

Sandbox test checklist:

- `NEXT_PUBLIC_USE_MOCK=false` and `NEXT_PUBLIC_API_URL` points to your backend.
- Pay in MP sandbox and confirm redirects:
  - success -> `/checkout/congrats?sessionId=...`
  - failure/pending -> `/checkout/[sessionId]?status=...` (banner visible)
- Verify webhook processes payment and tickets are retrievable on congrats page.

## Servicios del Frontend y datos esperados del Backend

Tabla de referencia para el BE con los servicios que consume el frontend, métodos principales y datos mínimos esperados. Novedades marcadas.

| Servicio (archivo) | Métodos clave | Endpoint(s) esperados (BE) | Datos que debe devolver el BE | Notas / Novedades |
| --- | --- | --- | --- | --- |
| AuthService (`src/services/AuthService.ts`) | `login`, `register`, `verifyEmail`, `checkAvailability`, `requestPasswordReset`, `resetPassword` | `/api/public/v1/auth/login`, `/api/public/v1/auth/register`, `/api/public/v1/auth/verify`, `/api/public/v1/auth/availability`, `/api/public/v1/auth/forgot`, `/api/public/v1/auth/reset` | Login: `{ token, user{ id, name, email, role } }`. Availability: `{ usernameAvailable?, emailAvailable? }`. Respuestas 2xx en resto. | Debe emitir JWT en `token`. Roles: `admin|seller|user`. |
| EventService (`src/services/EventService.ts`) | `getEvents`, `searchEvents`, `getEventById`, `createEvent`, `updateEvent`, `deleteEvent` | `/api/v1/events` (CRUD, auth), `/api/public/v1/event/search` (público) | Listado: `{ events[], total, page, pageSize, totalPages }` (ver `EventListResponseSchema`). Detalle: `EventDetail` con `tickets[]` ({ id, type, value, currency }). | Para sellers, BE puede filtrar por `sellerId` (query). |
| CheckoutService (`src/services/CheckoutService.ts`) | `createSession`, `getSession`, `addSessionData`, `processPayment` | `/api/public/v1/checkout/session` (POST/GET), `/api/public/v1/checkout/session/{sessionId}/data` (PUT), `/api/public/v1/checkout/process-payment` (POST) | `createSession`: `{ sessionId, eventId, priceId, quantity, mainEmail? }`. `getSession`: `SessionInfoResponse`. `addSessionData`: `SessionInfoResponse`. `processPayment`: `{ success, redirectUrl?, error? }`. | Novedad: `processPayment` debe crear preferencia MP y devolver `redirectUrl`. |
| MercadoPagoApi (`src/services/MercadoPagoApi.ts`) | `createCheckoutRedirect` | (Delegado a `CheckoutService.processPayment`) | Igual que `processPayment`. | Novedad: El frontend ahora usa este wrapper en el checkout. |
| TicketService (`src/services/TicketService.ts`) | `getTicketById`, `issueTicketsForSession` | (a definir) p.ej. `/api/private/v1/tickets/{ticketId}`, `/api/private/v1/checkout/{sessionId}/tickets` | Ticket: `{ id, orderId, eventId, eventName, buyerName, buyerEmail, qrLink, issuedAt }`. | En mocks se usa `NEXT_PUBLIC_APP_URL` para `qrLink`. |
| SalesService (`src/services/SalesService.ts`) | `list`, `toCSV` | `/api/v1/sales` (GET, auth) | Arreglo de ventas (ver `SalesListResponseSchema`). Campos: `id,date,eventId,eventName,sellerId,sellerName,buyerEmail,quantity,unitPrice,total,couponCode?,vendorCode?,paymentStatus,orderId`. | Filtra por `from,to,eventId,sellerId,query`. Si user es seller, se infiere `sellerId`. |
| ReportService (`src/services/ReportService.ts`) | `listSales` | `/api/private/v1/reports/sales` (GET, auth) | Página: `{ items: ReportSale[], total, page, pageSize, totalPages }`. | Útil para panel de reportes. |
| StatsService (`src/services/StatsService.ts`) | `getSellerSummary`, `getGlobalSummary` | `/api/private/v1/stats/seller/{sellerId}`, `/api/private/v1/stats/global` | Resumen con `totalEvents,ticketsSold,totalRevenue`. | Respuestas JSON simples. |
| VendorService (`src/services/VendorService.ts`) | `list`, `invite`, `setActive` | `/api/private/v1/vendors` (GET), `/api/private/v1/vendors/invite` (POST), `/api/private/v1/vendors/{id}/activate|disable` (POST) | Vendor: `{ id,name,email,role:'seller',status,events,createdAt }`. | Acceso privado (auth). |
| ValidatorService (`src/services/ValidatorService.ts`) | `validateTicket` | `/api/v1/events/{eventId}/sales/{ticketId}/validate` (POST, auth) | 204 sin cuerpo al validar correctamente. | Manejar 4xx/5xx con mensaje. |
| CouponService (`src/services/CouponService.ts`) | `listByEvent`, `create` | `/api/private/v1/events/{eventId}/coupons` (GET/POST) | Cupón: `{ id,eventId,code,type('percent'|'fixed'),value,maxUses?,used?,expiresAt?,active }`. | Acceso privado (auth). |
| ConfigService (`src/services/ConfigService.ts`) | `isMockedEnabled`, `getApiBase` | N/A | N/A | Usa `NEXT_PUBLIC_USE_MOCK` y `NEXT_PUBLIC_API_URL`. |

Notas clave para el BE (novedades recientes):

- MercadoPago: `processPayment` debe crear la preferencia y devolver `redirectUrl`. Configurar `back_urls` y `auto_return: "approved"`. Ver sección anterior.
- Checkout: `addSessionData` guarda `mainEmail`, `buyer[]` y `couponCode?`; el BE debería persistirlos asociados al `sessionId` para emitir tickets tras webhook.
- Congrats: la página `/checkout/congrats` espera poder recuperar tickets por `sessionId` (endpoint sugerido en `TicketService`).

## Flujo feliz (end-to-end)

1. Usuario elige evento en `/events` y selecciona entradas en `/events/[id]`.
2. Front crea sesión (`POST /api/public/v1/checkout/session`) y redirige a `/checkout/[sessionId]`.
3. Usuario ingresa email(es) y cupón (opcional); front envía `PUT /api/public/v1/checkout/session/{sessionId}/data`.
4. Front llama `POST /api/public/v1/checkout/process-payment`; BE crea preferencia MP y responde `redirectUrl`.
5. Usuario paga en MP y vuelve por `back_urls`:
   - éxito: `/checkout/congrats?sessionId=...`
   - pendiente/fallo: `/checkout/[sessionId]?status=...`
6. Webhook MP en el BE confirma pago y emite tickets para `sessionId`.
7. En `/checkout/congrats` el front lista tickets y permite abrir `/tickets/[ticketId]`.
8. Admin/Seller ve venta en Backoffice (`/admin/...`).
