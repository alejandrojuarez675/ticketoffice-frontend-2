# 🎟️ MVP TICKETS GRATIS - Checklist para Lanzamiento

> **Documento para reunión BE + FE**  
> Objetivo: Lanzar MVP funcional para venta de tickets GRATIS  
> Fecha: Diciembre 2025

---

## 📋 Resumen Ejecutivo

**Alcance del MVP:**
- ✅ Solo eventos GRATUITOS (sin integración de pagos)
- ✅ Compra de tickets sin MercadoPago
- ✅ Generación de tickets digitales
- ✅ Validación de entradas por organizador

**Lo que NO incluye este MVP:**
- ❌ Integración con MercadoPago (siguiente fase)
- ❌ Eventos de pago
- ❌ Envío de tickets por email (se muestra en pantalla)
- ❌ Scanner QR automático (validación manual)

---

## 🔴 BLOQUEANTES - Sin esto NO se puede lanzar

### Backend (BE) - Críticos

| # | Endpoint | Método | Descripción | Estado |
|---|----------|--------|-------------|--------|
| 1 | `/api/public/v1/checkout/session` | POST | Reenviar el tickets digitales al email | ❌ FALTA | PAGINA de envio de tickets
| 2 | `/api/public/v1/checkout/session/{sessionId}/tickets` | GET | Obtener todos los tickets de una sesión/compra | ❌ FALTA |
| 3 | `/api/public/v1/tickets/{ticketId}` | GET | Obtener ticket digital por ID | ❌ FALTA |

#### Detalle de Endpoints Faltantes:

**1. GET `/api/public/v1/tickets/{ticketId}`**

```json
// Response esperado
{
  "id": "ticket-uuid",
  "sessionId": "session-uuid",
  "eventId": "event-uuid",
  "eventName": "Nombre del Evento",
  "eventDate": "2025-06-07T20:00:00Z",
  "eventLocation": {
    "name": "Movistar Arena",
    "address": "Calle 123",
    "city": "Bogotá",
    "country": "Colombia"
  },
  "buyerName": "Juan Pérez",
  "buyerEmail": "juan@email.com",
  "ticketType": "Entrada General",
  "ticketCode": "ABC123XYZ",  // Código único para QR/validación
  "qrData": "https://tuapp.com/tickets/ticket-uuid", // URL o datos del QR
  "isValid": true,  // false si ya fue validado
  "validatedAt": null,  // fecha de validación si aplica
  "createdAt": "2025-06-01T10:00:00Z"
}
```

**2. GET `/api/public/v1/checkout/session/{sessionId}/tickets`**

```json
// Response esperado
{
  "sessionId": "session-uuid",
  "eventName": "Nombre del Evento",
  "tickets": [
    {
      "id": "ticket-1-uuid",
      "ticketType": "Entrada General",
      "buyerName": "Juan Pérez",
      "ticketCode": "ABC123",
      "isValid": true
    },
    {
      "id": "ticket-2-uuid",
      "ticketType": "Entrada General",
      "buyerName": "María López",
      "ticketCode": "DEF456",
      "isValid": true
    }
  ],
  "totalTickets": 2
}
```

---

### Frontend (FE) - Críticos

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| 1 | Conectar página de tickets con API real | `src/app/tickets/[ticketId]/page.tsx` | ❌ FALTA |
| 2 | Mostrar tickets después de compra exitosa | `src/app/checkout/congrats/CongratsClient.tsx` | ❌ FALTA |
| 3 | Actualizar TicketService para usar API real | `src/services/TicketService.ts` | ❌ FALTA |

---

## 🟡 IMPORTANTES - Mejoran la experiencia pero no bloquean

### Backend (BE)

| # | Endpoint/Tarea | Descripción | Estado |
|---|----------------|-------------|--------|
| 1 | Generar `ticketCode` único al crear ticket | Código alfanumérico para validación | ❓ Verificar |
| 2 | Marcar ticket como `validated` | Al llamar a `/validate` | ✅ Existe |
| 3 | Incluir `eventLocation` en respuesta de ticket | Para mostrar en ticket digital | ❓ Verificar |

### Frontend (FE)

| # | Tarea | Descripción | Estado |
|---|-------|-------------|--------|
| 1 | Generar QR en cliente | Librería `qrcode.react` | ❌ FALTA |
| 2 | Botón descargar/imprimir ticket | Funcionalidad de impresión | ❌ FALTA |
| 3 | Mejorar UI de ticket digital | Diseño bonito para mostrar/compartir | ❌ FALTA |

---

## 🟢 FUNCIONALES - Ya están listos

### Backend (BE) ✅

| Funcionalidad | Endpoint | Estado |
|---------------|----------|--------|
| Login | `POST /auth/login` | ✅ OK |
| Registro | `POST /auth/signup` | ✅ OK |
| Datos usuario | `GET /api/v1/users/me` | ✅ OK |
| Listar eventos propios | `GET /api/v1/events` | ✅ OK |
| Crear evento | `POST /api/v1/events` | ✅ OK |
| Editar evento | `PUT /api/v1/events/{id}` | ✅ OK |
| Eliminar evento | `DELETE /api/v1/events/{id}` | ✅ OK |
| Buscar eventos públicos | `GET /api/public/v1/event/search` | ✅ OK |
| Detalle evento público | `GET /api/public/v1/event/{id}` | ✅ OK |
| Crear sesión checkout | `POST /api/public/v1/checkout/session` | ✅ OK |
| Finalizar compra | `POST /api/public/v1/checkout/session/{id}/buy` | ✅ OK |
| Validar entrada | `POST /api/public/v1/checkout/session/{id}/validate` | ✅ OK |
| Listar ventas de evento | `GET /api/v1/events/{id}/sales` | ✅ OK |

### Frontend (FE) ✅

| Funcionalidad | Página | Estado |
|---------------|--------|--------|
| Home con eventos | `/` | ✅ OK |
| Búsqueda de eventos | `/events` | ✅ OK |
| Detalle de evento | `/events/[id]` | ✅ OK |
| Login | `/auth/login` | ✅ OK |
| Registro | `/auth/register` | ✅ OK |
| Dashboard organizador | `/admin/dashboard` | ✅ OK |
| Perfil | `/admin/profile` | ✅ OK |
| Lista de eventos | `/admin/events` | ✅ OK |
| Crear evento | `/admin/events/new` | ✅ OK |
| Editar evento | `/admin/events/[id]/edit` | ✅ OK |
| Ver ventas | `/admin/events/[id]/sales` | ✅ OK |
| Validar entrada manual | `/admin/events/[id]/validate` | ✅ OK |
| Checkout/Compra | `/checkout/[sessionId]` | ✅ OK |
| Confirmación compra | `/checkout/congrats` | ✅ OK (sin tickets aún) |

---

## 📝 CHECKLIST PASO A PASO

### Fase 1: Backend implementa endpoints de tickets (Prioridad ALTA)

```
[ ] 1.1 Crear modelo/entidad Ticket en base de datos
    - id (UUID)
    - sessionId (referencia a checkout session)
    - eventId (referencia a evento)
    - buyerName
    - buyerEmail
    - ticketType
    - ticketCode (único, para validación)
    - isValid (boolean, default true)
    - validatedAt (datetime, nullable)
    - createdAt

[ ] 1.2 Generar tickets automáticamente al llamar /buy
    - Por cada buyer en el request, crear 1 ticket
    - Generar ticketCode único (ej: 8 caracteres alfanuméricos)

[ ] 1.3 Implementar GET /api/public/v1/tickets/{ticketId}
    - Devolver datos del ticket + evento
    - No requiere autenticación (el ticketId es secreto)

[ ] 1.4 Implementar GET /api/public/v1/checkout/session/{sessionId}/tickets
    - Devolver lista de tickets de la sesión
    - No requiere autenticación

[ ] 1.5 Modificar /validate para marcar ticket como usado
    - Actualizar isValid = false
    - Guardar validatedAt = now()
```

### Fase 2: Frontend conecta con API real (Prioridad ALTA)

```
[ ] 2.1 Actualizar TicketService.ts
    - Implementar getTicketById() con API real
    - Implementar getTicketsBySession() con API real

[ ] 2.2 Actualizar página /tickets/[ticketId]
    - Llamar a API real en lugar de mock
    - Mostrar datos del ticket
    - Generar QR code con ticketCode

[ ] 2.3 Actualizar CongratsClient.tsx
    - Después de compra exitosa, obtener tickets
    - Mostrar lista de tickets con links
    - Botón "Ver mis tickets"

[ ] 2.4 Instalar librería QR
    - npm install qrcode.react
    - Generar QR con URL del ticket
```

### Fase 3: Testing y Deploy (Prioridad ALTA)

```
[ ] 3.1 Test flujo completo:
    - Crear evento gratuito
    - Comprar tickets (1-3 personas)
    - Ver tickets generados
    - Validar una entrada

[ ] 3.2 Test en móvil:
    - Verificar que tickets se vean bien
    - QR legible en pantalla

[ ] 3.3 Deploy:
    - Backend en producción
    - Frontend en Amplify
    - Variables de entorno configuradas
```

---

## 🔄 FLUJO COMPLETO MVP (Tickets Gratis)

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLUJO DEL COMPRADOR                         │
└─────────────────────────────────────────────────────────────────┘

1. Usuario busca eventos
   GET /api/public/v1/event/search
   
2. Usuario ve detalle de evento GRATUITO
   GET /api/public/v1/event/{id}
   
3. Usuario selecciona cantidad de tickets
   POST /api/public/v1/checkout/session
   → Devuelve sessionId
   
4. Usuario llena datos de compradores
   (Frontend: formulario con nombre, email, documento)
   
5. Usuario confirma "compra" (gratis)
   POST /api/public/v1/checkout/session/{sessionId}/buy
   → Backend genera tickets automáticamente
   
6. Frontend redirige a /checkout/congrats
   GET /api/public/v1/checkout/session/{sessionId}/tickets
   → Muestra lista de tickets generados
   
7. Usuario hace clic en un ticket
   GET /api/public/v1/tickets/{ticketId}
   → Ve su ticket digital con QR

┌─────────────────────────────────────────────────────────────────┐
│                     FLUJO DEL ORGANIZADOR                       │
└─────────────────────────────────────────────────────────────────┘

1. Organizador crea evento gratuito
   POST /api/v1/events
   
2. Organizador ve ventas/registros
   GET /api/v1/events/{id}/sales
   
3. En el evento, organizador valida entrada
   - Comprador muestra QR o dice su código
   - Organizador busca por sessionId o ticketCode
   POST /api/public/v1/checkout/session/{sessionId}/validate
   → Ticket marcado como usado
```

---

## 📊 ESTIMACIÓN DE TIEMPO

| Tarea | Responsable | Tiempo Estimado |
|-------|-------------|-----------------|
| Endpoints de tickets (BE) | Backend | 1-2 días |
| Integración FE con API | Frontend | 1 día |
| QR y mejoras UI ticket | Frontend | 0.5 días |
| Testing completo | Ambos | 0.5 días |
| **TOTAL** | | **3-4 días** |

---

## 🚀 DESPUÉS DEL MVP (Siguiente Fase)

1. **MercadoPago** - Eventos de pago
2. **Email** - Enviar tickets por correo
3. **Scanner QR** - Validación con cámara
4. **Dashboard** - Métricas y estadísticas reales
5. **Cupones** - Códigos de descuento

---

## 📞 PREGUNTAS PARA LA REUNIÓN

1. **¿Cómo se genera el ticketCode?**
   - Sugerencia: UUID corto o código alfanumérico de 8 caracteres
   - Debe ser único por ticket

2. **¿El ticket necesita datos adicionales?**
   - ¿Número de asiento?
   - ¿Zona/sector?

3. **¿Validación por sessionId o por ticketCode?**
   - Actual: por sessionId (valida todos los tickets de la sesión)
   - Alternativa: por ticketCode (valida ticket individual)

4. **¿Dónde se almacenan los tickets?**
   - ¿Nueva tabla en BD?
   - ¿Dentro de la sesión de checkout?

5. **¿Cuándo se generan los tickets?**
   - Sugerencia: Al momento de llamar /buy
   - No antes, para evitar tickets huérfanos

---

## ✅ DEFINICIÓN DE "DONE"

El MVP de tickets gratis está listo cuando:

1. [ ] Un usuario puede buscar y encontrar un evento gratuito
2. [ ] Un usuario puede "comprar" (registrarse para) el evento
3. [ ] El usuario ve sus tickets digitales con QR después de la compra
4. [ ] El usuario puede acceder a sus tickets por URL directa
5. [ ] El organizador puede ver las ventas/registros de su evento
6. [ ] El organizador puede validar una entrada (marcarla como usada)
7. [ ] El ticket validado ya no se puede usar de nuevo

---

*Documento creado para reunión de alineación BE + FE*
*Última actualización: Diciembre 2025*

