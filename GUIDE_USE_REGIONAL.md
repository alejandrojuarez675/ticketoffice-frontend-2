# Guía de Uso: Configuración Regional

## Concepto Importante ⚠️

**La configuración regional NO limita qué eventos puede ver el usuario.**

Solo afecta:

- ✅ **Formato de precios** - Símbolo de moneda (preparado para conversión futura)
- ✅ **Formato de fechas/horas** - Zona horaria del usuario
- ✅ **Formularios** - Tipos de documento según el país
- ✅ **Contexto para sellers** - Saber en qué horario crean eventos

El usuario puede **ver y comprar eventos de CUALQUIER país**.

---

## 1. Usar en Componentes

### Hook: `useRegionalFormat`

```tsx
import { useRegionalFormat } from "@/hooks/useRegionalFormat";

function EventCard({ event }) {
  const { formatPrice, formatDateTime, getCurrencySymbol } =
    useRegionalFormat();

  return (
    <Card>
      <Typography variant="h6">{event.title}</Typography>

      {/* Formatear precio con moneda del usuario */}
      <Typography>{formatPrice(event.price, event.currency)}</Typography>

      {/* Formatear fecha en zona horaria del usuario */}
      <Typography>{formatDateTime(event.date)}</Typography>
    </Card>
  );
}
```

### Hook: `useRegion`

```tsx
import { useRegion } from "@/contexts/RegionContext";

function CheckoutForm() {
  const { countryConfig, openRegionSelector, isConfigured } = useRegion();

  // Solicitar configuración si no existe (ej: al hacer checkout)
  useEffect(() => {
    if (!isConfigured) {
      openRegionSelector();
    }
  }, [isConfigured, openRegionSelector]);

  // Usar tipos de documento según la configuración
  const documentTypes = countryConfig?.documentType || [];

  return (
    <form>
      <Select label="Tipo de documento">
        {documentTypes.map((type) => (
          <MenuItem key={type.code} value={type.code}>
            {type.name}
          </MenuItem>
        ))}
      </Select>
    </form>
  );
}
```

---

## 2. Filtros de Eventos

Los filtros permiten ver eventos de **cualquier país**:

```tsx
// ❌ INCORRECTO - No hacer esto
const userCountry = useRegion().countryCode;
const events = await EventService.searchEvents({
  country: userCountry, // Esto limitaría eventos solo del país del usuario
});

// ✅ CORRECTO - Permitir filtrar por cualquier país
<FiltersPanel />;
// El usuario elige qué país filtrar, no está limitado por su configuración
```

---

## 3. Creación de Eventos (Sellers)

Al crear eventos, mostrar al seller en qué zona horaria está creando:

```tsx
function CreateEventForm() {
  const { getTimezone, formatDateTime } = useRegionalFormat();

  const timezone = getTimezone();
  const now = formatDateTime(new Date());

  return (
    <form>
      <Alert severity="info">
        Estás creando el evento en zona horaria: <strong>{timezone}</strong>
        <br />
        Hora actual: {now}
      </Alert>

      <TextField
        type="datetime-local"
        label="Fecha y hora del evento"
        helperText={`Según tu zona horaria (${timezone})`}
      />
    </form>
  );
}
```

---

## 4. Compra de Tickets

Al momento de comprar, asegurar que el usuario tenga configuración regional:

```tsx
function CheckoutPage() {
  const { isConfigured, openRegionSelector, countryConfig } = useRegion();
  const { formatPrice } = useRegionalFormat();

  useEffect(() => {
    // Si no está configurado, solicitar antes de continuar con compra
    if (!isConfigured) {
      openRegionSelector();
    }
  }, [isConfigured, openRegionSelector]);

  if (!isConfigured) {
    return <Loading />;
  }

  return (
    <Box>
      {/* Mostrar precio en moneda del usuario */}
      <Typography>
        Total: {formatPrice(ticket.price, ticket.currency)}
      </Typography>

      {/* Formulario con tipos de documento según configuración */}
      <Select label="Tipo de documento">
        {countryConfig.documentType.map((type) => (
          <MenuItem key={type.code} value={type.code}>
            {type.name} - {type.description}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
```

---

## 5. Conversión de Moneda (Futuro)

Preparado para implementar conversión en tiempo real:

```tsx
// En useRegionalFormat.ts - línea ~36
const formatPrice = (amount: number, originalCurrency?: string) => {
  const userCurrency = currencyCode || "USD";

  // FUTURO: Aquí llamar API de conversión
  // if (originalCurrency !== userCurrency) {
  //   amount = await convertCurrency(amount, originalCurrency, userCurrency);
  // }

  return `${getCurrencySymbol()} ${amount}`;
};
```

---

## 6. Mostrar Configuración al Usuario

Permitir que el usuario vea y cambie su configuración:

```tsx
function UserSettings() {
  const { countryConfig, countryCode, openRegionSelector } = useRegion();

  return (
    <Box>
      <Typography variant="h6">Tu configuración regional</Typography>

      {countryConfig && (
        <List>
          <ListItem>
            <ListItemText primary="País" secondary={countryConfig.data.name} />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Moneda"
              secondary={countryConfig.availableCurrencies[0]?.name}
            />
          </ListItem>
          <ListItem>
            <ListItemText primary="Zona horaria" secondary={getTimezone()} />
          </ListItem>
        </List>
      )}

      <Button onClick={openRegionSelector}>Cambiar configuración</Button>

      <Alert severity="info">
        Esta configuración solo afecta cómo ves precios y horarios. Puedes ver
        eventos de cualquier país.
      </Alert>
    </Box>
  );
}
```

---

## Resumen

✅ **SÍ usar configuración regional para:**

- Formatear precios y mostrar símbolos de moneda
- Formatear fechas y horas en zona horaria del usuario
- Mostrar tipos de documento en formularios
- Dar contexto a sellers al crear eventos

❌ **NO usar configuración regional para:**

- Limitar qué eventos puede ver el usuario
- Filtrar eventos automáticamente por país
- Restringir compras a cierto país

El usuario tiene **libertad total** para explorar eventos de cualquier país, y la configuración regional solo personaliza su experiencia de visualización y formularios.
