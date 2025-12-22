# 📊 DATA_BE_PARA_FRONT.md

**Documento de Requisitos de Backend para Frontend**  
**Proyecto**: TuEntradaYa - Plataforma de Venta de Entradas  
**Fecha**: Diciembre 2025  
**Versión**: 1.0

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Endpoints Faltantes](#endpoints-faltantes)
3. [Campos Faltantes en Respuestas Existentes](#campos-faltantes)
4. [Mejoras Recomendadas](#mejoras-recomendadas)
5. [Prioridades](#prioridades)

---

## 🎯 Resumen Ejecutivo

Este documento detalla todos los datos, endpoints y campos que el **Frontend necesita del Backend** para completar la funcionalidad de la plataforma TuEntradaYa. Está organizado por prioridad y casos de uso.

### Estado Actual
- ✅ **Funcional**: Autenticación, Eventos, Ventas, Checkout (básico)
- ⚠️ **Parcial**: Tickets digitales, Estadísticas, Reportes
- ❌ **Faltante**: MercadoPago, Envío de emails, QR avanzado

---

## 🔴 Endpoints Faltantes (Críticos)

### 1. Tickets Digitales

#### `GET /api/public/v1/tickets/{ticketId}`
**Prioridad**: 🔴 CRÍTICA  
**Descripción**: Obtener un ticket digital individual para mostrar al comprador

**Request**:
```http
GET /api/public/v1/tickets/{ticketId}
```

**Response esperado**:
```json
{
  "id": "ticket-uuid",
  "saleId": "sale-uuid",
  "eventId": "event-uuid",
  "eventTitle": "Concierto de Rock",
  "eventDate": "2026-01-15T20:00:00Z",
  "eventLocation": {
    "name": "Teatro Colón",
    "address": "Cerrito 628",
    "city": "Buenos Aires",
    "country": "Argentina"
  },
  "ticketType": "Entrada General",
  "buyerName": "Juan Pérez",
  "buyerEmail": "juan@example.com",
  "buyerDocument": "12345678",
  "qrCode": "https://tuentradaya.com/admin/events/{eventId}/validate?sale-id={saleId}",
  "validated": false,
  "validatedAt": null,
  "purchaseDate": "2025-12-20T10:30:00Z",
  "price": 5000,
  "currency": "ARS"
}
```

**Uso en Frontend**:
- Página `/tickets/[ticketId]` para mostrar el ticket
- Email de confirmación (link al ticket)
- Descarga de PDF del ticket

---

#### `GET /api/public/v1/checkout/session/{sessionId}/tickets`
**Prioridad**: 🔴 CRÍTICA  
**Descripción**: Obtener todos los tickets de una sesión de compra

**Request**:
```http
GET /api/public/v1/checkout/session/{sessionId}/tickets
```

**Response esperado**:
```json
{
  "sessionId": "session-uuid",
  "tickets": [
    {
      "id": "ticket-uuid-1",
      "ticketType": "Entrada General",
      "buyerName": "Juan Pérez",
      "qrCode": "https://...",
      "validated": false
    },
    {
      "id": "ticket-uuid-2",
      "ticketType": "VIP",
      "buyerName": "María García",
      "qrCode": "https://...",
      "validated": false
    }
  ],
  "totalTickets": 2
}
```

**Uso en Frontend**:
- Página de confirmación post-compra
- Mostrar todos los tickets comprados
- Permitir descarga individual o en lote

---

### 2. MercadoPago Integration

#### `POST /api/v1/checkout/session/{sessionId}/payment/mercadopago`
**Prioridad**: 🟡 ALTA  
**Descripción**: Iniciar pago con MercadoPago

**Request**:
```json
{
  "sessionId": "session-uuid",
  "returnUrl": "https://tuentradaya.com/checkout/{sessionId}?status=success",
  "pendingUrl": "https://tuentradaya.com/checkout/{sessionId}?status=pending",
  "failureUrl": "https://tuentradaya.com/checkout/{sessionId}?status=failure"
}
```

**Response esperado**:
```json
{
  "initPoint": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=xxx",
  "preferenceId": "xxx-xxx-xxx",
  "externalReference": "session-uuid"
}
```

**Uso en Frontend**:
- Redirigir al usuario a MercadoPago
- Procesar el pago de entradas pagas

---

#### `POST /api/webhooks/mercadopago`
**Prioridad**: 🟡 ALTA  
**Descripción**: Webhook para recibir notificaciones de MercadoPago (IPN)

**Request** (desde MercadoPago):
```json
{
  "action": "payment.created",
  "api_version": "v1",
  "data": {
    "id": "payment-id"
  },
  "date_created": "2025-12-20T10:30:00Z",
  "id": 12345,
  "live_mode": true,
  "type": "payment",
  "user_id": "seller-id"
}
```

**Response esperado**:
```http
200 OK
```

**Uso en Frontend**:
- No se llama directamente desde el frontend
- Backend debe actualizar el estado de la venta
- Frontend consulta el estado con el siguiente endpoint

---

#### `GET /api/v1/checkout/session/{sessionId}/payment-status`
**Prioridad**: 🟡 ALTA  
**Descripción**: Consultar el estado del pago de una sesión

**Request**:
```http
GET /api/v1/checkout/session/{sessionId}/payment-status
```

**Response esperado**:
```json
{
  "sessionId": "session-uuid",
  "paymentStatus": "approved", // approved | pending | rejected | cancelled
  "paymentMethod": "credit_card",
  "paymentId": "mp-payment-id",
  "transactionAmount": 10000,
  "currency": "ARS",
  "paidAt": "2025-12-20T10:35:00Z",
  "ticketsGenerated": true
}
```

**Uso en Frontend**:
- Polling después de volver de MercadoPago
- Mostrar estado del pago
- Redirigir a tickets cuando `paymentStatus === 'approved'`

---

### 3. Envío de Emails

#### `POST /api/v1/checkout/session/{sessionId}/send-tickets`
**Prioridad**: 🟡 ALTA  
**Descripción**: Enviar tickets por email al comprador

**Request**:
```json
{
  "sessionId": "session-uuid",
  "email": "comprador@example.com"
}
```

**Response esperado**:
```json
{
  "success": true,
  "message": "Tickets enviados correctamente",
  "emailsSent": 2
}
```

**Uso en Frontend**:
- Botón "Reenviar tickets" en página de confirmación
- Opción en perfil de usuario

---

### 4. Estadísticas del Dashboard

#### `GET /api/v1/stats/seller`
**Prioridad**: 🟢 MEDIA  
**Descripción**: Obtener estadísticas del vendedor para el dashboard

**Request**:
```http
GET /api/v1/stats/seller
Authorization: Bearer {token}
```

**Response esperado**:
```json
{
  "totalEvents": 15,
  "activeEvents": 8,
  "totalSales": 450,
  "totalRevenue": 2250000,
  "currency": "ARS",
  "salesByMonth": [
    { "month": "2025-11", "sales": 120, "revenue": 600000 },
    { "month": "2025-12", "sales": 330, "revenue": 1650000 }
  ],
  "topEvents": [
    {
      "eventId": "event-uuid-1",
      "title": "Concierto Rock",
      "sales": 200,
      "revenue": 1000000
    },
    {
      "eventId": "event-uuid-2",
      "title": "Festival Jazz",
      "sales": 150,
      "revenue": 750000
    }
  ],
  "recentSales": [
    {
      "saleId": "sale-uuid-1",
      "eventTitle": "Concierto Rock",
      "buyerName": "Juan Pérez",
      "amount": 5000,
      "date": "2025-12-20T10:30:00Z"
    }
  ]
}
```

**Uso en Frontend**:
- Dashboard principal del vendedor
- Gráficos de ventas
- Métricas clave

---

### 5. Forgot/Reset Password

#### `POST /api/v1/auth/forgot-password`
**Prioridad**: 🟢 MEDIA  
**Descripción**: Solicitar recuperación de contraseña

**Request**:
```json
{
  "email": "usuario@example.com"
}
```

**Response esperado**:
```json
{
  "success": true,
  "message": "Se ha enviado un correo con instrucciones para recuperar tu contraseña"
}
```

**Uso en Frontend**:
- Página `/auth/forgot`
- Enviar email con token de recuperación

---

#### `POST /api/v1/auth/reset-password`
**Prioridad**: 🟢 MEDIA  
**Descripción**: Restablecer contraseña con token

**Request**:
```json
{
  "token": "reset-token-from-email",
  "newPassword": "newSecurePassword123"
}
```

**Response esperado**:
```json
{
  "success": true,
  "message": "Contraseña actualizada correctamente"
}
```

**Uso en Frontend**:
- Página `/auth/reset?token=xxx`
- Cambiar contraseña

---

## 🟡 Campos Faltantes en Respuestas Existentes

### 1. Eventos (`GET /api/v1/events/{id}`)

**Campos que faltan**:
```json
{
  "tags": ["Concierto", "Rock", "Mayor de edad"], // Array de strings
  "minAge": 18, // Edad mínima (opcional)
  "maxCapacity": 500, // Capacidad máxima del evento
  "soldTickets": 234, // Tickets vendidos hasta ahora
  "location": {
    "latitude": -34.6037,  // ✅ YA AGREGADO en sesión anterior
    "longitude": -58.3816  // ✅ YA AGREGADO en sesión anterior
  }
}
```

**Impacto**:
- `tags`: Filtrado por categorías en `/events`
- `minAge`: Filtro "Mayores de edad"
- `maxCapacity` y `soldTickets`: Mostrar disponibilidad en tiempo real

---

### 2. Ventas (`GET /api/v1/events/{eventId}/sales`)

**Campos que faltan**:
```json
{
  "sales": [
    {
      "id": "sale-uuid",
      "buyerName": "Juan Pérez",
      "buyerEmail": "juan@example.com",
      "buyerPhone": "+54 11 1234-5678", // FALTA
      "ticketType": "Entrada General",
      "quantity": 2,
      "totalAmount": 10000,
      "validated": false,
      "validatedAt": null,
      "validatedBy": null, // FALTA - ID del usuario que validó
      "purchaseDate": "2025-12-20T10:30:00Z",
      "paymentMethod": "mercadopago" // FALTA
    }
  ]
}
```

**Impacto**:
- Mejor información en tabla de ventas
- Auditoría de validaciones

---

### 3. Usuario (`GET /api/v1/users/me`)

**Campos que faltan**:
```json
{
  "id": "user-uuid",
  "username": "juanperez",
  "email": "juan@example.com",
  "name": "Juan Pérez",
  "role": "seller",
  "phone": "+54 11 1234-5678", // FALTA
  "profileImage": "https://...", // FALTA
  "emailVerified": true, // FALTA
  "createdAt": "2025-01-01T00:00:00Z",
  "preferences": { // FALTA - Objeto completo
    "emailNotifications": true,
    "pushNotifications": false,
    "marketingEmails": true
  }
}
```

**Impacto**:
- Pantalla de configuración completa
- Gestión de preferencias

---

## 🔵 Mejoras Recomendadas

### 1. Paginación Consistente

**Problema**: Algunos endpoints no devuelven metadata de paginación

**Solución**: Estandarizar todas las respuestas de listas:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

**Endpoints afectados**:
- `GET /api/v1/events` ✅ Ya tiene
- `GET /api/v1/events/{id}/sales` ❌ Falta
- `GET /api/public/v1/events/search` ✅ Ya tiene

---

### 2. Manejo de Errores Estandarizado

**Problema**: Respuestas de error inconsistentes

**Solución**: Formato estándar para todos los errores:
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Usuario o contraseña incorrectos",
    "details": {
      "field": "password",
      "reason": "invalid"
    },
    "timestamp": "2025-12-20T10:30:00Z"
  }
}
```

---

### 3. Rate Limiting Headers

**Recomendación**: Agregar headers de rate limiting:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

### 4. Webhooks de Eventos

**Recomendación**: Sistema de webhooks para notificar al frontend:
- Venta nueva
- Entrada validada
- Pago aprobado
- Evento cancelado

---

## 📊 Prioridades

### 🔴 CRÍTICO (Sprint Actual)
1. ✅ `GET /api/public/v1/tickets/{ticketId}` - **Tickets digitales**
2. ✅ `GET /api/public/v1/checkout/session/{sessionId}/tickets` - **Lista de tickets**

### 🟡 ALTA (Próximo Sprint)
3. ✅ `POST /api/v1/checkout/session/{sessionId}/payment/mercadopago` - **Iniciar pago MP**
4. ✅ `GET /api/v1/checkout/session/{sessionId}/payment-status` - **Estado de pago**
5. ✅ `POST /api/webhooks/mercadopago` - **Webhook MP**
6. ✅ `POST /api/v1/checkout/session/{sessionId}/send-tickets` - **Enviar tickets**

### 🟢 MEDIA (Backlog)
7. ✅ `GET /api/v1/stats/seller` - **Estadísticas dashboard**
8. ✅ `POST /api/v1/auth/forgot-password` - **Recuperar contraseña**
9. ✅ `POST /api/v1/auth/reset-password` - **Restablecer contraseña**
10. ✅ Campos adicionales en eventos (`tags`, `minAge`, `maxCapacity`, `soldTickets`)
11. ✅ Campos adicionales en ventas (`buyerPhone`, `validatedBy`, `paymentMethod`)
12. ✅ Campos adicionales en usuario (`phone`, `profileImage`, `preferences`)

### 🔵 BAJA (Futuro)
13. Sistema de webhooks
14. Rate limiting
15. Notificaciones push
16. Exportación de reportes en PDF

---

## 📝 Notas Técnicas

### Formato de Fechas
- **Usar siempre**: ISO 8601 con timezone UTC
- **Ejemplo**: `2025-12-20T10:30:00Z`
- **Frontend**: Convertirá a timezone local del usuario

### Monedas
- **Soportadas**: `ARS` (Argentina), `COP` (Colombia)
- **Formato**: Números enteros (sin decimales)
- **Ejemplo**: `5000` = $5.000 ARS

### IDs
- **Formato**: UUID v4
- **Ejemplo**: `123e4567-e89b-12d3-a456-426614174000`

### Paginación
- **pageNumber**: 0-based (primera página = 0)
- **pageSize**: Valores recomendados: 10, 20, 50, 100

---

## 🔗 Referencias

- **MVP_ROADMAP.md**: Arquitectura completa del proyecto
- **RESPUESTAS_IA.md**: Historial de cambios y decisiones
- **OpenAPI Spec**: (Pendiente - solicitar al equipo de Backend)

---

**Documento generado por**: Frontend Team  
**Última actualización**: Diciembre 2025  
**Versión**: 1.0


