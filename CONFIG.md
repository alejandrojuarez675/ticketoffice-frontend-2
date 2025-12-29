# Configuración del Proyecto

## Variables de Entorno

Para configurar correctamente la conexión con el backend, crea un archivo `.env.local` en la raíz del proyecto:

```bash
# .env.local

# URL del backend
NEXT_PUBLIC_API_BASE_URL=https://yscqvjs2zg.us-east-1.awsapprunner.com

# Modo de mocks (false para usar API real, true para datos simulados)
NEXT_PUBLIC_USE_MOCKS=false

# URL de la aplicación (opcional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Modos de Operación

### Modo API Real (Recomendado para desarrollo con backend)

```bash
NEXT_PUBLIC_USE_MOCKS=false
```

En este modo:

- ✅ Se conecta al backend real
- ✅ Los datos vienen de la API
- ✅ Se usa el endpoint `/api/public/v1/form/country` para obtener países
- ✅ Se usa el endpoint `/api/public/v1/form/country/{countryCode}/config` para configuración

### Modo Mock (Para desarrollo sin backend)

```bash
NEXT_PUBLIC_USE_MOCKS=true
```

En este modo:

- ⚠️ Usa datos simulados
- ⚠️ No se conecta al backend
- ⚠️ Útil solo para desarrollo de UI

## Verificar Configuración

1. **Indicador Visual**: En desarrollo, verás un chip en la esquina inferior derecha:

   - 🧪 **MOCK MODE** (amarillo) = Usando datos simulados
   - ☁️ **API MODE** (verde) = Conectado a la API real

2. **Consola del Navegador**: Al cargar la app, verás:

   ```
   🔧 ConfigService
   API Base: https://yscqvjs2zg.us-east-1.awsapprunner.com
   App URL: http://localhost:3000
   Mocks: Deshabilitados
   Ambiente: Desarrollo
   ```

3. **Logs de RegionService**: Al abrir el modal de selección de país:
   ```
   RegionService.getCountries called { useMocks: false }
   RegionService.getCountries: calling API { url: "..." }
   Countries fetched successfully from API { count: 2, countries: [...] }
   ```

## Troubleshooting

### Los mocks siguen activos aunque `NEXT_PUBLIC_USE_MOCKS=false`

1. Verifica que el archivo `.env.local` existe en la raíz del proyecto
2. Reinicia el servidor de desarrollo: `npm run dev`
3. Limpia la caché: `rm -rf .next`
4. Verifica en la consola que la configuración se cargó correctamente

### Error al conectar con la API

1. Verifica que la URL del backend es correcta
2. Verifica que el backend está corriendo
3. Revisa la consola del navegador para ver el error exacto
4. Verifica que no hay problemas de CORS

### El modal de país no muestra los países correctos

1. Abre la consola del navegador
2. Busca los logs de `RegionService.getCountries`
3. Verifica que `useMocks: false`
4. Verifica la respuesta de la API en los logs

## Estructura de Datos del Backend

### Endpoint: `/api/public/v1/form/country`

Retorna un array de países:

```json
[
  {
    "code": "ARG",
    "name": "Argentina"
  },
  {
    "code": "COL",
    "name": "Colombia"
  }
]
```

**IMPORTANTE**: El campo `code` es el identificador que se usa para obtener la configuración del país.

### Endpoint: `/api/public/v1/form/country/{countryCode}/config`

Retorna la configuración completa del país:

```json
{
  "data": {
    "code": "ARG",
    "name": "Argentina"
  },
  "cities": [
    {
      "code": "CABA",
      "name": "Buenos Aires"
    }
  ],
  "language": "es-AR",
  "availableCurrencies": [
    {
      "code": "ARS",
      "name": "Peso Argentino",
      "symbol": "$"
    }
  ],
  "documentType": [
    {
      "code": "DNI",
      "name": "DNI",
      "description": "Documento Nacional de Identidad"
    }
  ]
}
```

## Desarrollo

```bash
# Instalar dependencias
npm install

# Crear archivo de configuración
cp .env.local.example .env.local
# Editar .env.local con tus valores

# Iniciar servidor de desarrollo
npm run dev

# Abrir http://localhost:3000
```

## Producción

En producción, los mocks SIEMPRE están desactivados, sin importar la variable de entorno.
