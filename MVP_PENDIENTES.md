# MVP PENDIENTES - Análisis Detallado

> **Documento de seguimiento de tareas pendientes para el MVP**  
> Última actualización: Diciembre 2025  
> Basado en: Documentación de Postman del Backend

---

## 📋 Resumen de Estado

| Área | Estado | Prioridad |
|------|--------|-----------|
| Autenticación | 🟢 Funcional | - |
| Registro | 🟢 Funcional | - |
| CRUD Eventos | 🟢 Funcional | - |
| Búsqueda Pública | 🟢 Funcional | - |
| Checkout/Compra | 🟢 Funcional | - |
| Envío de Tickets por Email | 🔴 No Implementado | P0 |
| Integración MercadoPago | 🔴 No Implementado | P1 |
| Escaneo QR | 🔴 No Implementado | P2 |
| Dashboard con Métricas Reales | 🟡 Mock Only | P2 |

---

## ✅ Correcciones Realizadas (Sesión Actual)

### 1. Endpoint `/users/me` corregido
- **Problema**: El frontend llamaba a `/users/me` pero el backend espera `/api/v1/users/me`
- **Archivo**: `src/services/AuthService.ts`
- **Estado**: ✅ SOLUCIONADO

### 2. Mensaje de confirmación de compra
- **Problema**: Mostraba el `sessionId` técnico al usuario
- **Archivo**: `src/app/checkout/congrats/CongratsClient.tsx`
- **Estado**: ✅ SOLUCIONADO - Mejorado el UI con iconos y mejor UX

---

## 🔴 PENDIENTES CRÍTICOS (P0 - Bloqueantes para MVP)

### 1. Envío de Tickets por Email

**Descripción**: Después de una compra exitosa, el sistema debe enviar los tickets digitales al correo del comprador.

**Requerimientos**:
- [ ] Backend debe implementar endpoint de envío de emails
- [ ] Generar PDF/imagen del ticket con código QR
- [ ] Incluir información del evento, fecha, tipo de entrada
- [ ] El frontend ya muestra el mensaje "Recibirás un correo..."

**Sugerencias para Backend**:
```yaml
POST /api/v1/checkout/session/{sessionId}/send-tickets
  Request: { email: string }
  Response: { success: boolean, message: string }
```

**Alternativa inmediata (sin cambios de BE)**:
- Mostrar los tickets directamente en una página `/tickets/{ticketId}` después de la compra
- El usuario puede descargar/capturar su ticket desde ahí

### 2. Generación de Tickets Digitales

**Estado actual**: El endpoint `GET /api/public/v1/tickets/{ticketId}` NO existe en el backend.

**Requerimientos para Frontend**:
- [ ] Página `/tickets/[ticketId]/page.tsx` - Ya existe pero usa mocks
- [ ] Mostrar QR code del ticket
- [ ] Información del evento y comprador
- [ ] Opción de descargar/imprimir

**Requerimientos para Backend**:
```yaml
GET /api/public/v1/tickets/{ticketId}
  Response: {
    id: string,
    eventId: string,
    eventName: string,
    eventDate: string,
    eventLocation: { name, address, city, country },
    buyerName: string,
    buyerEmail: string,
    ticketType: string,
    qrCode: string,  # URL o base64 del QR
    isValid: boolean,
    validatedAt?: string
  }

GET /api/public/v1/checkout/session/{sessionId}/tickets
  Response: { tickets: Ticket[] }
```

---

## 🟡 PENDIENTES IMPORTANTES (P1)

### 3. Integración con MercadoPago

**Estado actual**: El flujo de checkout funciona pero NO hay integración real con MercadoPago.

**Flujo esperado**:
1. Usuario completa formulario de compra → `POST /checkout/session/{id}/buy` ✅
2. Frontend redirige a MercadoPago para pago → ❌ NO IMPLEMENTADO
3. MercadoPago procesa y redirige de vuelta → ❌ NO IMPLEMENTADO
4. Webhook actualiza estado de la orden → ❌ NO IMPLEMENTADO

**Endpoints necesarios en Backend**:
```yaml
# Crear preferencia de pago MercadoPago
POST /api/public/v1/checkout/session/{sessionId}/payment/mercadopago
  Request: { 
    returnUrls: { 
      success: string, 
      failure: string, 
      pending: string 
    } 
  }
  Response: { 
    preferenceId: string,
    initPoint: string  # URL de MercadoPago para redirect
  }

# Webhook de MercadoPago (llamado por MP)
POST /api/webhooks/mercadopago
  Request: (IPN payload de MercadoPago)
  Response: { received: true }

# Consultar estado de pago
GET /api/public/v1/checkout/session/{sessionId}/payment-status
  Response: { 
    status: 'pending' | 'approved' | 'rejected' | 'cancelled',
    paymentId?: string,
    paymentMethod?: string
  }
```

**Tareas Frontend** (cuando BE esté listo):
- [ ] Actualizar `CheckoutService.ts` con método `createPaymentPreference()`
- [ ] Redirigir a `initPoint` de MercadoPago después del `/buy`
- [ ] Página de callback `/checkout/callback?payment_id=...` para manejar retorno
- [ ] Polling o WebSocket para actualizar estado de pago

### 4. Forgot/Reset Password

**Estado actual**: Páginas existen pero lanzan error "Función no disponible en el MVP".

**Endpoints necesarios**:
```yaml
POST /auth/forgot-password
  Request: { email: string }
  Response: { message: string }

POST /auth/reset-password
  Request: { token: string, newPassword: string }
  Response: { success: boolean }
```

**Archivos a modificar** (cuando BE esté listo):
- `src/services/AuthService.ts` - métodos `requestPasswordReset` y `resetPassword`
- `src/app/auth/forgot/page.tsx`
- `src/app/auth/reset/page.tsx`

---

## 🟢 PENDIENTES DESEABLES (P2)

### 5. Escáner QR para Validación

**Estado actual**: Validación manual funciona. Escaneo QR no implementado.

**Librería recomendada**: `html5-qrcode` o `@zxing/browser`

**Tareas**:
- [ ] Instalar librería de escaneo QR
- [ ] Componente `QRScanner.tsx`
- [ ] Integrar en `/admin/events/[id]/validate/page.tsx`
- [ ] Llamar a `POST /api/public/v1/checkout/session/{sessionId}/validate` con el código

### 6. Dashboard con Métricas Reales

**Estado actual**: Dashboard muestra datos hardcodeados/mock.

**Endpoints necesarios**:
```yaml
GET /api/v1/stats/seller
  Response: {
    totalEvents: number,
    activeEvents: number,
    ticketsSold: number,
    totalRevenue: number,
    currency: string,
    revenueByEvent: [{ eventId, name, sold, revenue }],
    salesTrend: [{ date, count, amount }]
  }
```

### 7. Exportar Lista de Asistentes

**Estado actual**: ✅ IMPLEMENTADO en frontend (`src/utils/exportExcel.ts`)

**Verificar**: Que el botón de exportar esté visible en `/admin/events/[id]/sales`

### 8. Perfil de Usuario

**Estado actual**: Página existe, necesita verificar funcionalidad completa.

**Campos a mostrar/editar**:
- Nombre, apellido, email
- Teléfono (opcional)
- Cambiar contraseña
- Datos de organizador (si aplica)

---

## 📊 Alineación Frontend ↔ Backend

### Endpoints del Backend (Documentación Postman)

| Método | Endpoint | Frontend | Estado |
|--------|----------|----------|--------|
| POST | `/auth/signup` | `AuthService.register()` | ✅ OK |
| POST | `/auth/login` | `AuthService.login()` | ✅ OK |
| GET | `/api/v1/users/me` | `AuthService.me()` | ✅ CORREGIDO |
| GET | `/api/v1/users` | No usado | ⚪ Admin only |
| GET | `/api/v1/events` | `EventService.getEvents()` | ✅ OK |
| GET | `/api/v1/events/{id}` | `EventService.getEventById()` | ✅ OK |
| POST | `/api/v1/events` | `EventService.createEvent()` | ✅ OK |
| PUT | `/api/v1/events/{id}` | `EventService.updateEvent()` | ✅ OK |
| DELETE | `/api/v1/events/{id}` | `EventService.deleteEvent()` | ✅ OK |
| GET | `/api/public/v1/event/search` | `EventService.searchEvents()` | ✅ OK |
| GET | `/api/public/v1/event/{id}` | `EventService.getPublicById()` | ✅ OK |
| GET | `/api/public/v1/event/{id}/recommendations` | `EventService.getRecommendations()` | ✅ OK |
| POST | `/api/public/v1/checkout/session` | `CheckoutService.createSession()` | ✅ OK |
| POST | `/api/public/v1/checkout/session/{id}/buy` | `CheckoutService.buy()` | ✅ OK |

### Endpoints que NO existen en Backend (Necesarios para MVP completo)

| Prioridad | Endpoint | Descripción |
|-----------|----------|-------------|
| P0 | `GET /api/public/v1/tickets/{id}` | Obtener ticket digital |
| P0 | `GET /api/public/v1/checkout/session/{id}/tickets` | Tickets de una sesión |
| P1 | `POST /api/public/v1/checkout/session/{id}/payment/mercadopago` | Crear preferencia MP |
| P1 | `POST /api/webhooks/mercadopago` | Webhook IPN |
| P1 | `GET /api/public/v1/checkout/session/{id}/payment-status` | Estado del pago |
| P1 | `POST /auth/forgot-password` | Solicitar reset |
| P1 | `POST /auth/reset-password` | Ejecutar reset |
| P2 | `GET /api/v1/stats/seller` | Estadísticas del vendedor |
| P2 | `POST /api/v1/checkout/session/{id}/send-tickets` | Reenviar tickets |

---

## 🚀 Recomendaciones para Continuar

### Opción A: MVP Mínimo (Sin MercadoPago)

1. **Permitir solo eventos gratuitos** para el lanzamiento inicial
2. Generar tickets digitales después de `/buy`
3. Mostrar tickets en una página pública `/tickets/{id}`
4. El organizador valida manualmente o con QR

**Ventaja**: Se puede lanzar sin integración de pagos
**Desventaja**: Solo eventos gratis

### Opción B: MVP con MercadoPago

1. Backend implementa endpoints de MercadoPago
2. Frontend redirige a MP después del checkout
3. Webhook procesa el pago
4. Se generan y envían tickets

**Ventaja**: Funcionalidad completa
**Desventaja**: Requiere más desarrollo de BE + certificación MP

### Recomendación Final

**Ir por Opción A primero**:
1. Lanzar con eventos gratuitos
2. Implementar visualización de tickets digitales
3. Agregar MercadoPago en una segunda iteración

Esto permite:
- Validar el producto con usuarios reales
- Recoger feedback temprano
- Desarrollar MercadoPago con más tiempo

---

## 📝 Notas de la Sesión

- El flujo de registro → login está funcionando correctamente con el BE
- El endpoint correcto para obtener datos del usuario es `/api/v1/users/me`
- El flujo de compra (`/checkout/session` → `/buy`) funciona correctamente
- Falta implementar la entrega de tickets digitales al comprador

---

*Documento generado automáticamente. Última actualización: Diciembre 2025*

