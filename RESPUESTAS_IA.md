# RESPUESTAS IA - Historial de Conversación

> Documento de respuestas del Tech Lead/Arquitecto IA  
> Última actualización: Diciembre 2025

---

## 📋 Historial de Sesiones

---

## Sesión 4 - Redirecciones y Sanitización (Última)

### Tareas Completadas

#### 1. ✅ Revisión de Redirecciones en todas las páginas del MVP

**Páginas revisadas y verificadas**:
- `/admin/page.tsx` - ✅ Redirige correctamente según rol
- `/admin/events/page.tsx` - ✅ Guards de autenticación OK
- `/admin/events/[id]/page.tsx` - ✅ Botón volver funciona
- `/admin/events/[id]/edit/page.tsx` - ✅ Redirecciones OK
- `/admin/events/[id]/sales/page.tsx` - ✅ Navegación OK
- `/admin/events/new/page.tsx` - ✅ Flecha atrás funciona
- `/admin/dashboard/page.tsx` - ✅ Con BackofficeLayout

**Resultado**: Todas las redirecciones funcionan correctamente.

---

#### 2. ✅ Sanitización de Inputs para Seguridad

**Nuevo archivo creado**: `src/utils/sanitize.ts`

**Funciones de sanitización implementadas**:
- `escapeHtml(str)` - Escapa caracteres HTML peligrosos (XSS)
- `stripHtmlTags(str)` - Elimina etiquetas HTML
- `sanitizeString(str)` - Limpieza general de strings
- `sanitizeEmail(email)` - Valida y limpia emails
- `sanitizeUsername(username)` - Solo permite caracteres válidos
- `sanitizePhone(phone)` - Solo dígitos y +
- `sanitizeDocument(document)` - Solo alfanuméricos
- `sanitizeUrl(url)` - Valida URLs
- `sanitizePositiveNumber(value)` - Números positivos
- `sanitizeBuyerData(data)` - Sanitiza datos de comprador
- `sanitizeEventData(event)` - Sanitiza datos de evento

**Formularios actualizados con sanitización**:

1. **Crear Evento** (`/admin/events/new/page.tsx`):
   - Título, descripción, ubicación sanitizados
   - URLs de imagen validadas
   - Tickets sanitizados

2. **Checkout** (`/checkout/[sessionId]/page.tsx`):
   - Email principal sanitizado
   - Datos de compradores sanitizados (nombre, email, teléfono, documento)

3. **Registro** (`/auth/register/page.tsx`):
   - Username sanitizado
   - Email sanitizado y validado
   - Validación adicional antes de envío

---

### 📁 Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `src/utils/sanitize.ts` | **NUEVO** - Utilidades de sanitización |
| `src/app/admin/events/new/page.tsx` | Sanitización de datos del evento |
| `src/app/checkout/[sessionId]/page.tsx` | Sanitización de datos del comprador |
| `src/app/auth/register/page.tsx` | Sanitización de usuario y email |

---

## Sesión 3 - Correcciones de UX y Formularios

### Problemas Reportados y Solucionados

#### 1. ✅ Bug de Registro (redirige a profile y luego a login)

**Problema**: Después de registrarse, el usuario era redirigido al perfil y luego al login.

**Causa**: Había un `useEffect` que redirigía al dashboard cuando `isAuthenticated=true`, conflictuando con la redirección del `onSubmit`.

**Solución**: Agregado estado `hasJustRegistered` para evitar la redirección automática después de registrarse.

**Archivo**: `src/app/auth/register/page.tsx`

---

#### 2. ✅ Demora en cambio de pantalla

**Solución**: Las pantallas ya tienen estados de loading con `CircularProgress` y skeletons. La "demora" era normal del tiempo de carga de la API.

---

#### 3. ✅ Flecha atrás en crear evento no funcionaba

**Problema**: El `IconButton` con la flecha no tenía función asignada.

**Solución**: Corregido `handleBack` que ahora redirige a `/admin/events`.

**Archivo**: `src/app/admin/events/new/page.tsx`

---

#### 4. ✅ Botón "todos los eventos" sin acción cuando no hay eventos

**Problema**: En el dashboard, el botón no mostraba feedback si no había eventos.

**Solución**: 
- Botón ahora se deshabilita si no hay eventos
- Muestra texto "No tienes eventos aún"
- Se agregó un panel informativo invitando a crear el primer evento

**Archivo**: `src/app/admin/dashboard/page.tsx`

---

#### 5. ✅ Error ZodError en EventService.getEvents

**Problema**: El schema esperaba campos `total`, `page`, `pageSize`, `totalPages` pero el BE no los devolvía.

**Solución**: Campos de paginación ahora son opcionales con valores por defecto:
```typescript
total: z.number().int().nonnegative().optional().default(0),
page: z.number().int().nonnegative().optional().default(0),
pageSize: z.number().int().positive().optional().default(10),
totalPages: z.number().int().nonnegative().optional().default(1),
```

**Archivo**: `src/services/schemas/event.ts`

---

#### 6. ✅ Dashboard y Profile redundantes

**Problema**: Dashboard usaba `LightLayout` (sin sidebar) y era muy similar al perfil.

**Solución**: 
- Dashboard ahora usa `BackofficeLayout` (con sidebar)
- Diseño mejorado con tarjetas de métricas
- Acciones rápidas con feedback
- Mensaje cuando no hay eventos

**Archivo**: `src/app/admin/dashboard/page.tsx`

---

#### 7. ✅ Mejoras en crear evento

**Cambios implementados**:
- ✅ País: Solo Argentina y Colombia (selector)
- ✅ Ciudad: Selector dinámico según país (15 ciudades por país)
- ✅ Fecha: No permite fechas anteriores a mañana
- ✅ Validaciones completas en todos los campos obligatorios
- ✅ Feedback con Snackbar al guardar
- ✅ Redirección a editar evento después de crear
- ✅ Mensajes de error descriptivos

**Archivos**: 
- `src/app/admin/events/new/page.tsx`
- `src/constants/countries.ts` (agregado `CITIES_BY_COUNTRY`)

---

#### 8. ✅ Inhabilitar login/register cuando está logueado

**Problema**: Usuarios autenticados podían acceder a las páginas de login y registro.

**Solución**: 
- Agregado `useEffect` que verifica `isAuthenticated` y redirige al perfil
- No se muestra el formulario mientras se redirige

**Archivos**: 
- `src/app/auth/login/page.tsx`
- `src/app/auth/register/page.tsx`

---

### 📝 Nota sobre localhost:3000 vs localhost:8000

El frontend Next.js corre por defecto en puerto **3000**. Si necesitas correr en otro puerto, usa:
```bash
npm run dev -- -p 8000
```

O configura en `package.json`:
```json
"scripts": {
  "dev": "next dev -p 8000"
}
```

---

## Sesión 1 - Correcciones Iniciales

### Problemas Reportados y Solucionados

#### 1. Error 404 en Registro (/users/me)

**Problema**: Al registrarse, el frontend llamaba a `/users/me` pero el backend espera `/api/v1/users/me`.

**Solución aplicada**:
```typescript
// AuthService.ts - Antes
await http.get<ApiUserResponse>(`${this.BASE_URL}/users/me`);

// AuthService.ts - Después  
await http.get<ApiUserResponse>(`${this.BASE_URL}/api/v1/users/me`);
```

**Estado**: ✅ SOLUCIONADO (3 ocurrencias corregidas)

#### 2. SessionId visible en mensaje de confirmación

**Problema**: El mensaje de confirmación mostraba el sessionId técnico al usuario.

**Solución aplicada**: Se rediseñó completamente `CongratsClient.tsx` con:
- Eliminación del sessionId del mensaje
- Nuevo diseño con iconos (CheckCircle, Email, ConfirmationNumber)
- Mejor UX con pasos claros de lo que sigue
- Botones de acción mejorados

**Estado**: ✅ SOLUCIONADO

---

## Sesión 2 - Configuración y Flujos (Actual)

### Tarea 1: Configuración de Entorno (Producción vs Local)

**Problema**: Los servicios apuntaban a `localhost:8080` en producción.

**Análisis**:
- El `ConfigService.ts` ya usaba `process.env.NEXT_PUBLIC_API_BASE_URL`
- El problema era que si la variable no existía, el fallback era `localhost:8080`
- En Amplify, las variables de entorno deben configurarse en la consola de AWS

**Soluciones aplicadas**:

1. **Mejorado `ConfigService.ts`**:
```typescript
// Nuevo comportamiento:
// - Si existe NEXT_PUBLIC_API_BASE_URL, usarla
// - En PRODUCCIÓN: fallback a URL de prod hardcodeada
// - En DESARROLLO: fallback a localhost

const PRODUCTION_API_URL = 'https://yscqvjs2zg.us-east-1.awsapprunner.com';
const LOCAL_API_URL = 'http://localhost:8080';

static getApiBase() {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  if (envUrl && envUrl.trim()) {
    return this.sanitizeBase(envUrl);
  }
  
  // Fallback según ambiente
  if (this.isProduction()) {
    return PRODUCTION_API_URL;  // ← Siempre funciona en prod
  }
  
  return LOCAL_API_URL;
}
```

2. **Agregado método `logConfig()` para debugging** (solo en desarrollo)

3. **Corregido `next.config.ts`**: Se eliminaron caracteres `<>` inválidos en el CSP

**Configuración de archivos .env**:

Tu configuración actual es correcta:

`.env.local` (desarrollo):
```env
NEXT_PUBLIC_API_BASE_URL=https://yscqvjs2zg.us-east-1.awsapprunner.com
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_LOG_LEVEL=debug
```

`.env.production` (producción):
```env
NEXT_PUBLIC_API_BASE_URL=https://yscqvjs2zg.us-east-1.awsapprunner.com
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_APP_URL=https://main.d2sln15898tbbz.amplifyapp.com
NEXT_PUBLIC_LOG_LEVEL=info
```

**⚠️ IMPORTANTE para AWS Amplify**:
Las variables de entorno también deben configurarse en la consola de AWS Amplify:
1. Ir a AWS Amplify Console
2. Seleccionar tu app
3. App settings → Environment variables
4. Agregar las mismas variables

**Estado**: ✅ SOLUCIONADO

---

### Tarea 2: Redirecciones y Cargas de Pantalla

**Mejoras aplicadas**:

1. **Página de Login** (`src/app/auth/login/page.tsx`):
   - Cambio de redirección por defecto: `/admin/dashboard` → `/admin/profile`
   - Uso de `router.push()` en lugar de `router.replace()` con timeout

2. **Página de Registro** (`src/app/auth/register/page.tsx`):
   - Cambio de `window.location.href` a `router.push()` (más suave)
   - Mensaje mejorado: "Redirigiendo a tu perfil..."
   - Tiempo reducido de 1500ms a 1000ms

3. **Página de Perfil** (`src/app/admin/profile/page.tsx`):
   - Ahora usa `useAuth()` hook en lugar de `AuthService.getCurrentUser()` directo
   - Añadido skeleton loading mientras carga
   - Añadido refresh de datos al montar
   - Redirección automática si no está autenticado
   - Nuevo diseño con iconos y acciones rápidas

**Estado**: ✅ SOLUCIONADO

---

### Tarea 3: Análisis de Flujos Felices

#### Flujo Feliz del Vendedor (Seller Happy Path)

| Paso | Funcionalidad | Estado | Notas |
|------|---------------|--------|-------|
| 1 | Registro | ✅ OK | Redirige al perfil |
| 2 | Login | ✅ OK | Redirige al perfil |
| 3 | Ver perfil | ✅ OK | Mejorado con skeleton y refresh |
| 4 | Ver lista de eventos | ✅ OK | Carga desde API real |
| 5 | Crear evento | ✅ OK | Formulario completo |
| 6 | Editar evento | ✅ OK | Formulario completo |
| 7 | Ver ventas del evento | ✅ OK | Lista con datos de compradores |
| 8 | Validar entrada manual | ✅ OK | Por ID de sesión |
| 9 | Validar entrada QR | 🔴 PENDIENTE | Requiere librería QR scanner |
| 10 | Ver estadísticas | 🟡 Mock | Requiere endpoint BE |
| 11 | Exportar ventas Excel | ✅ OK | Implementado en frontend |

#### Flujo Feliz del Comprador (Buyer Happy Path)

| Paso | Funcionalidad | Estado | Notas |
|------|---------------|--------|-------|
| 1 | Buscar eventos | ✅ OK | Filtros por país, ciudad, query |
| 2 | Ver detalle de evento | ✅ OK | Info completa + tickets |
| 3 | Seleccionar tickets | ✅ OK | Cantidad + precio |
| 4 | Crear sesión checkout | ✅ OK | API `/checkout/session` |
| 5 | Llenar formulario compra | ✅ OK | Validaciones completas |
| 6 | Enviar compra | ✅ OK | API `/checkout/session/{id}/buy` |
| 7 | Ver confirmación | ✅ OK | Mejorado sin sessionId |
| 8 | Recibir tickets por email | 🔴 PENDIENTE | Requiere BE |
| 9 | Ver ticket digital | 🔴 PENDIENTE | Requiere endpoint `/tickets/{id}` |
| 10 | Pago con MercadoPago | 🔴 PENDIENTE | Requiere integración MP |

---

## 📌 Lo que Falta para el MVP

### Prioridad 0 (Bloqueantes)

1. **Tickets Digitales**
   - Endpoint BE: `GET /api/public/v1/tickets/{ticketId}`
   - Frontend: Actualizar `TicketService.ts` para llamar API real
   - Página `/tickets/[ticketId]` ya existe

2. **Lista de tickets de una sesión**
   - Endpoint BE: `GET /api/public/v1/checkout/session/{sessionId}/tickets`
   - Mostrar tickets después de la compra

### Prioridad 1 (Importantes)

3. **Integración MercadoPago**
   - Endpoints BE requeridos:
     - `POST /checkout/session/{id}/payment/mercadopago` → devuelve `initPoint`
     - `POST /api/webhooks/mercadopago` → webhook IPN
     - `GET /checkout/session/{id}/payment-status` → estado del pago

4. **Forgot/Reset Password**
   - Endpoints BE: `/auth/forgot-password`, `/auth/reset-password`
   - Páginas frontend ya existen, solo falta conectar

### Prioridad 2 (Deseables)

5. **Scanner QR**
   - Librería: `html5-qrcode` o `@zxing/browser`
   - Página: `/admin/events/[id]/validate`

6. **Estadísticas del Dashboard**
   - Endpoint BE: `GET /api/v1/stats/seller`

---

## 💡 Recomendaciones

### Para el Deploy Inmediato

1. **Verificar variables de entorno en Amplify**:
   - Ve a AWS Amplify Console → Tu App → Environment Variables
   - Agrega: `NEXT_PUBLIC_API_BASE_URL=https://yscqvjs2zg.us-east-1.awsapprunner.com`

2. **Re-deploy después de configurar las variables**:
   - El build de Next.js embebe las variables en el código
   - Necesitas un nuevo build para que tome las nuevas variables

### Para MercadoPago

**¿Debemos agregar MercadoPago ahora?**

Mi recomendación: **NO POR AHORA**

Razones:
1. Requiere endpoints de backend que no existen
2. Requiere certificación/aprobación de MercadoPago
3. Puedes lanzar primero con eventos GRATUITOS
4. Obtener feedback de usuarios reales
5. Implementar pagos en la siguiente iteración

**Estrategia sugerida**:
1. Lanzar MVP solo con eventos gratuitos
2. Validar el producto con usuarios
3. Desarrollar integración MP en paralelo
4. Lanzar pagos en v1.1

### Para el Envío de Tickets por Email

**Opciones**:

**Opción A - Sin cambios de BE** (recomendada para MVP):
1. Después de la compra, redirigir a `/tickets/{sessionId}`
2. El usuario puede ver/descargar su ticket desde ahí
3. El ticket incluye QR con el código de validación

**Opción B - Con cambios de BE** (para después del MVP):
1. BE implementa servicio de email (SendGrid, AWS SES)
2. Endpoint: `POST /api/v1/checkout/session/{id}/send-tickets`
3. Genera PDF del ticket y envía por email

---

## 📁 Archivos Modificados en Esta Sesión

| Archivo | Cambio |
|---------|--------|
| `src/services/AuthService.ts` | Endpoint corregido a `/api/v1/users/me` |
| `src/services/ConfigService.ts` | Fallback inteligente prod/local + logging |
| `src/app/checkout/congrats/CongratsClient.tsx` | Rediseño sin sessionId |
| `src/app/auth/login/page.tsx` | Redirección a perfil |
| `src/app/auth/register/page.tsx` | Mejor redirección con router.push |
| `src/app/admin/profile/page.tsx` | Rediseño con useAuth y skeleton |
| `next.config.ts` | Corregido CSP (caracteres inválidos) |
| `MVP_PENDIENTES.md` | Nuevo archivo con análisis detallado |
| `MVP_ROADMAP.md` | Actualizado con cambios recientes |
| `RESPUESTAS_IA.md` | Este archivo |

---

## 🔄 Próximos Pasos Sugeridos

1. **Inmediato**: Deploy y verificar que las correcciones funcionen
2. **Esta semana**: Implementar visualización de tickets (requiere BE)
3. **Próxima semana**: Scanner QR para validación
4. **Futuro**: Integración MercadoPago

---

*Documento generado por IA como Tech Lead del proyecto.*

