# 📋 Requerimientos del Backend para MVP Frontend

> **Documento para el equipo de Backend**
> 
> Este documento especifica los endpoints que el Frontend necesita para completar el MVP.
> Generado automáticamente desde el análisis del código Frontend.

---

## 🎯 Estado Actual

### ✅ Endpoints YA IMPLEMENTADOS y funcionando:

| Endpoint | Método | Descripción | Estado FE |
|----------|--------|-------------|-----------|
| `/api/public/v1/events/search` | GET | Buscar eventos públicos | ✅ Conectado |
| `/api/public/v1/events/{eventId}` | GET | Detalle de evento público | ✅ Conectado |
| `/api/public/v1/checkout/session` | POST | Crear sesión de checkout | ✅ Conectado |
| `/api/public/v1/checkout/session/{sessionId}/buy` | POST | Finalizar compra | ✅ Conectado |
| `/api/public/v1/checkout/session/{sessionId}/validate` | POST | Validar entrada (QR) | ✅ Conectado |
| `/auth/login` | POST | Autenticación | ✅ Conectado |
| `/auth/signup` | POST | Registro de usuario | ✅ Conectado |
| `/users/me` | GET | Obtener usuario actual | ✅ Conectado |
| `/api/v1/events` | GET | Listar eventos del seller | ✅ Conectado |
| `/api/v1/events` | POST | Crear evento | ✅ Conectado |
| `/api/v1/events/{id}` | PUT | Actualizar evento | ✅ Conectado |
| `/api/v1/events/{id}` | DELETE | Eliminar evento | ✅ Conectado |
| `/api/v1/events/{id}/sales` | GET | Ventas de un evento | ✅ Conectado |

---

## 🔴 Endpoints NECESARIOS para completar MVP

### 1. Tickets Digitales (CRÍTICO)

**Endpoint necesario:**
```
GET /api/public/v1/tickets/{ticketId}
```

**Contexto:**
- Después de la compra, cada asistente recibe un email con un QR
- El QR contiene un link tipo: `https://app.com/tickets/{ticketId}`
- El Frontend necesita mostrar el ticket digital con los datos del evento

**Request:**
```
GET /api/public/v1/tickets/{ticketId}
Authorization: (opcional - puede ser público para que el comprador vea su ticket)
```

**Response esperada:**
```json
{
  "ticketId": "uuid",
  "sessionId": "uuid",
  "eventId": "uuid",
  "event": {
    "title": "Nombre del Evento",
    "date": "2024-12-15T20:00:00Z",
    "location": {
      "name": "Teatro X",
      "address": "Calle Y #123",
      "city": "Bogotá"
    }
  },
  "attendee": {
    "name": "Juan",
    "lastName": "Pérez",
    "email": "juan@email.com",
    "document": "123456789"
  },
  "ticketType": "VIP",
  "status": "valid" | "used" | "cancelled",
  "validatedAt": "2024-12-15T21:00:00Z" | null,
  "qrCode": "data:image/png;base64,..." // o URL del QR
}
```

**Prioridad:** 🔴 ALTA - Sin esto el comprador no puede ver su ticket

---

### 2. Procesar Pago con MercadoPago (CRÍTICO para tickets de PAGO)

**Endpoint necesario:**
```
POST /api/public/v1/checkout/session/{sessionId}/process-payment
```

**Contexto:**
- Para tickets de pago, después de llenar el formulario de checkout
- El Frontend llama a este endpoint
- El BE crea la preferencia de MercadoPago y devuelve la URL de redirección

**Request:**
```json
{
  "returnUrls": {
    "success": "https://app.com/checkout/congrats?sessionId=xxx",
    "failure": "https://app.com/checkout/xxx?status=failure",
    "pending": "https://app.com/checkout/xxx?status=pending"
  }
}
```

**Response esperada:**
```json
{
  "success": true,
  "redirectUrl": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=xxx",
  "preferenceId": "xxx"
}
```

**Prioridad:** 🔴 ALTA - Sin esto no se pueden vender tickets de pago

---

### 3. Estado de Pago (DESEABLE)

**Endpoint necesario:**
```
GET /api/public/v1/checkout/session/{sessionId}/payment-status
```

**Contexto:**
- Después de que el usuario vuelve de MercadoPago
- El Frontend verifica el estado del pago

**Response esperada:**
```json
{
  "sessionId": "uuid",
  "paymentStatus": "approved" | "pending" | "rejected" | "in_process",
  "paymentId": "mp-payment-id",
  "paidAt": "2024-12-15T20:30:00Z" | null
}
```

**Prioridad:** 🟡 MEDIA - Actualmente redirigimos a congrats y confiamos en el webhook

---

## 🟢 Endpoints OPCIONALES (Post-MVP)

Estos endpoints NO son necesarios para el MVP pero serían útiles:

### 1. Estadísticas del Seller
```
GET /api/v1/stats/seller/{sellerId}
```
Response: `{ totalEvents, ticketsSold, totalRevenue, upcomingEvents }`

### 2. Reportes de Ventas
```
GET /api/v1/reports/sales?eventId=xxx&from=date&to=date
```
Response: Lista paginada de ventas con filtros

### 3. Gestión de Cupones
```
GET /api/v1/events/{eventId}/coupons
POST /api/v1/events/{eventId}/coupons
```

### 4. Gestión de Vendedores (Admin)
```
GET /api/v1/vendors
POST /api/v1/vendors/invite
POST /api/v1/vendors/{id}/activate
POST /api/v1/vendors/{id}/disable
```

### 5. Reenviar Tickets
```
POST /api/public/v1/checkout/session/{sessionId}/resend-tickets
```

---

## 📝 Notas sobre Contratos de Datos

### Formato de Fechas
El Frontend espera fechas en formato **ISO 8601**: `2024-12-15T20:00:00Z`

### Formato de Dinero
El Frontend maneja precios como **números enteros** (sin decimales para COP/ARS).
Ejemplo: `150000` para $150.000 COP

### Roles de Usuario
El Frontend espera roles en mayúsculas:
- `ADMIN` → se mapea a `admin`
- `SELLER` o `ORGANIZER` → se mapea a `seller`
- `USER` → se mapea a `user`

### Estructura de Evento
```typescript
{
  id: string;
  title: string;
  description: string;
  date: string; // ISO 8601
  image: { url: string };
  location: {
    name: string;
    address: string;
    city: string;
    country: string;
  };
  tickets: Array<{
    id: string;
    type: string;
    value: number;
    currency: string;
    totalTickets: number;
    soldTickets: number;
  }>;
  organizer: {
    id: string;
    name: string;
  };
}
```

---

## ❓ Preguntas para el Backend

1. **¿El endpoint de tickets `/api/public/v1/tickets/{ticketId}` está planeado?**
   - El QR redirige a una página que necesita mostrar el ticket

2. **¿El endpoint de process-payment para MercadoPago está en desarrollo?**
   - Actualmente solo funciona el flujo de tickets gratis con `buy()`

3. **¿Cómo se generan los QR de los tickets?**
   - ¿El BE envía el QR en el email?
   - ¿El QR contiene `sessionId` o `ticketId`?

4. **¿Hay algún cambio planeado en los endpoints existentes?**
   - Queremos asegurar compatibilidad

---

## 🔄 Cómo mantener este documento

Cuando el Backend implemente un endpoint:
1. Mover de "NECESARIOS" a "IMPLEMENTADOS"
2. Notificar al equipo FE para conectar el endpoint
3. El FE ajustará `ConfigService.isMockedEnabled()` → `false` para ese servicio

---

*Última actualización: Generado automáticamente*

