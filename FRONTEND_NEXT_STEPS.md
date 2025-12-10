# 🚀 Próximos Pasos Frontend - MVP

> **Documento de planificación para el equipo Frontend**
> 
> Este documento lista las tareas pendientes, pruebas de concepto y mejoras recomendadas.

---

## 📊 Estado Actual del MVP

### ✅ Flujos COMPLETOS (Conectados con BE)

| Flujo | Estado | Archivos |
|-------|--------|----------|
| Búsqueda de eventos | ✅ 100% | `EventService.searchEvents()` |
| Detalle de evento | ✅ 100% | `EventService.getPublicById()` |
| Checkout tickets gratis | ✅ 100% | `CheckoutService.createSession()` + `buy()` |
| Login/Registro | ✅ 100% | `AuthService.login()` + `register()` |
| CRUD eventos (seller) | ✅ 100% | `EventService.*` |
| Ver ventas | ✅ 100% | `SalesService.listByEvent()` |
| Validar entradas | ✅ 100% | `SalesService.validate()` |

### 🟡 Flujos PARCIALES

| Flujo | Estado | Bloqueante |
|-------|--------|------------|
| Checkout tickets de pago | 🟡 70% | Falta `process-payment` del BE |
| Ver ticket digital | 🟡 50% | Falta endpoint `/tickets/{id}` del BE |

---

## 📋 Tareas Pendientes (Prioridad Alta)

### 1. Pruebas de Integración End-to-End

**Objetivo:** Verificar que todos los flujos funcionan correctamente con el BE real.

**Checklist de pruebas:**

```
BUYER:
[ ] Buscar un evento existente
[ ] Ver detalle del evento
[ ] Seleccionar tickets (gratis)
[ ] Completar checkout con datos de comprador
[ ] Verificar que llegue email de confirmación
[ ] (Cuando esté listo) Probar flujo de pago con MercadoPago

SELLER:
[ ] Login con cuenta de seller
[ ] Ver dashboard con eventos
[ ] Crear un evento nuevo
[ ] Editar un evento existente
[ ] Ver ventas de un evento
[ ] Validar una entrada (manual)
[ ] (Cuando esté listo) Escanear QR de ticket

ADMIN:
[ ] Login con cuenta de admin
[ ] Ver todos los eventos
[ ] Acceder a validación global
```

**Cómo ejecutar:**
1. Desactivar mocks: `NEXT_PUBLIC_USE_MOCK=false`
2. Configurar URL del BE: `NEXT_PUBLIC_API_URL=https://api.ejemplo.com`
3. Ejecutar cada flujo manualmente

---

### 2. Implementar Escáner QR (F3-003)

**Objetivo:** Permitir validación de entradas escaneando el QR con la cámara.

**Archivos a crear/modificar:**
- `src/components/common/QRScanner.tsx` (fue eliminado, recrear)

**Tecnología recomendada:**
- Opción A: **BarcodeDetector API** (nativo, Chrome 88+)
- Opción B: **html5-qrcode** (librería externa, más compatible)

**Prueba de concepto:**
```tsx
// Instalar: npm install html5-qrcode

import { Html5QrcodeScanner } from 'html5-qrcode';

function QRScanner({ onScan }: { onScan: (code: string) => void }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    });
    
    scanner.render(
      (decodedText) => {
        onScan(decodedText);
        scanner.clear();
      },
      (error) => console.warn(error)
    );
    
    return () => scanner.clear();
  }, []);
  
  return <div id="reader" />;
}
```

**Integración:**
- Usar en `/admin/events/[id]/validate`
- El QR contiene el `sessionId`
- Llamar a `SalesService.validate(sessionId)`

---

### 3. Mejorar Página de Ticket Digital

**Objetivo:** Cuando el BE implemente `/tickets/{id}`, mostrar el ticket correctamente.

**Archivo:** `src/app/tickets/[ticketId]/page.tsx`

**Mejoras:**
- [ ] Diseño visual del ticket (como boleto real)
- [ ] Mostrar QR para entrada
- [ ] Opción de agregar a Apple Wallet / Google Pay
- [ ] Botón para descargar como PDF

---

### 4. Testing de Componentes Críticos

**Objetivo:** Asegurar que los componentes clave funcionan correctamente.

**Pruebas unitarias recomendadas:**

```
src/hooks/useCheckoutFlow.ts
- [ ] Test: carga datos de sesión correctamente
- [ ] Test: maneja error de sesión inválida
- [ ] Test: submitPurchase llama a CheckoutService.buy()

src/hooks/useTicketValidation.ts  
- [ ] Test: previene doble validación
- [ ] Test: maneja error 404 (ticket no encontrado)
- [ ] Test: maneja error 400 (ya validado)

src/services/CheckoutService.ts
- [ ] Test: createSession con datos válidos
- [ ] Test: buy con payload correcto
```

**Herramienta recomendada:** Jest + React Testing Library

---

## 📋 Tareas Pendientes (Prioridad Media)

### 5. Optimizar Performance

**Métricas actuales a medir:**
- [ ] First Contentful Paint (FCP)
- [ ] Largest Contentful Paint (LCP)
- [ ] Cumulative Layout Shift (CLS)

**Mejoras posibles:**
- [ ] Lazy loading de imágenes de eventos
- [ ] Prefetch de páginas frecuentes
- [ ] Reducir bundle size (analizar con `next build`)

---

### 6. Mejorar Manejo de Errores

**Objetivo:** Experiencia de usuario más clara cuando algo falla.

**Tareas:**
- [ ] Usar `HttpErrorAlert` en todas las páginas con llamadas API
- [ ] Agregar retry automático en errores 5xx
- [ ] Mostrar estado offline cuando no hay conexión

---

### 7. Accesibilidad (a11y)

**Checklist básico:**
- [ ] Todos los inputs tienen labels
- [ ] Contraste de colores WCAG AA
- [ ] Navegación por teclado funcional
- [ ] Screen reader friendly (aria-labels)

---

## 🧪 Pruebas de Concepto Recomendadas

### POC 1: Integración MercadoPago (cuando BE esté listo)

**Objetivo:** Verificar flujo completo de pago.

**Pasos:**
1. Crear evento con tickets de pago
2. Iniciar checkout
3. Llamar a `processPayment()`
4. Verificar redirección a MercadoPago
5. Completar pago en sandbox
6. Verificar redirección a `/checkout/congrats`

---

### POC 2: Notificaciones Push

**Objetivo:** Notificar al comprador cuando su ticket está listo.

**Tecnología:** Web Push API + Service Worker

**Alcance:** Post-MVP

---

### POC 3: PWA (Progressive Web App)

**Objetivo:** Permitir "instalar" la app en el teléfono.

**Pasos:**
1. Crear `public/manifest.json`
2. Configurar Service Worker básico
3. Agregar meta tags para PWA

**Alcance:** Post-MVP

---

## 📅 Cronograma Sugerido

```
SEMANA ACTUAL:
├── Día 1-2: Pruebas E2E de flujos completos
├── Día 3: Implementar QR Scanner
└── Día 4-5: Fix de bugs encontrados

PRÓXIMA SEMANA:
├── Integración MercadoPago (cuando BE esté listo)
├── Página de ticket digital mejorada
└── Testing de componentes críticos

POST-MVP:
├── Optimización de performance
├── PWA básico
└── Features adicionales (cupones, reportes)
```

---

## 🔧 Comandos Útiles

```bash
# Desarrollo con mocks
NEXT_PUBLIC_USE_MOCK=true npm run dev

# Desarrollo con BE real
NEXT_PUBLIC_USE_MOCK=false NEXT_PUBLIC_API_URL=http://localhost:8080 npm run dev

# Build de producción
npm run build

# Analizar bundle
npm run build && npx @next/bundle-analyzer
```

---

## ❓ Decisiones Pendientes

1. **¿Implementamos QR Scanner con BarcodeDetector nativo o html5-qrcode?**
   - Nativo: Mejor performance, menos compatibilidad
   - html5-qrcode: Más compatible, requiere dependencia

2. **¿Agregamos testing E2E con Playwright/Cypress?**
   - Pro: Tests automatizados de flujos completos
   - Con: Tiempo de setup y mantenimiento

3. **¿Implementamos PWA para el MVP o post-MVP?**
   - MVP: Solo manifest básico
   - Post-MVP: Service Worker completo con offline support

---

*Última actualización: Generado automáticamente*

