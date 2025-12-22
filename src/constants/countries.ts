/**
 * [F1-007] Constantes de países para formularios
 * 
 * GUÍA: Lista de países soportados en el MVP (Colombia + Argentina + Latam)
 * 
 * Uso:
 * ```tsx
 * import { COUNTRIES, SUPPORTED_COUNTRIES } from '@/constants/countries';
 * 
 * // En Select:
 * COUNTRIES.map(country => <MenuItem key={country} value={country}>{country}</MenuItem>)
 * ```
 */

// Países con soporte completo de pagos en el MVP
export const SUPPORTED_COUNTRIES = ['Argentina', 'Colombia'] as const;

// Todos los países disponibles en formularios (nacionalidad del comprador)
export const COUNTRIES = [
  'Argentina',
  'Bolivia', 
  'Brasil', 
  'Chile', 
  'Colombia', 
  'Costa Rica', 
  'Cuba',
  'Ecuador', 
  'El Salvador', 
  'España',
  'Estados Unidos', 
  'Guatemala', 
  'Honduras', 
  'México', 
  'Nicaragua',
  'Panamá', 
  'Paraguay', 
  'Perú', 
  'Puerto Rico', 
  'República Dominicana',
  'Uruguay', 
  'Venezuela', 
  'Otro'
] as const;

// Tipos TypeScript derivados de las constantes
export type SupportedCountry = typeof SUPPORTED_COUNTRIES[number];
export type Country = typeof COUNTRIES[number];

// Mapa de país a código ISO (para futura integración con APIs)
export const COUNTRY_ISO_MAP: Record<string, string> = {
  'Argentina': 'AR',
  'Bolivia': 'BO',
  'Brasil': 'BR',
  'Chile': 'CL',
  'Colombia': 'CO',
  'Costa Rica': 'CR',
  'Cuba': 'CU',
  'Ecuador': 'EC',
  'El Salvador': 'SV',
  'España': 'ES',
  'Estados Unidos': 'US',
  'Guatemala': 'GT',
  'Honduras': 'HN',
  'México': 'MX',
  'Nicaragua': 'NI',
  'Panamá': 'PA',
  'Paraguay': 'PY',
  'Perú': 'PE',
  'Puerto Rico': 'PR',
  'República Dominicana': 'DO',
  'Uruguay': 'UY',
  'Venezuela': 'VE',
};

// Ciudades principales por país (para selector de eventos)
export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  'Argentina': [
    'Buenos Aires',
    'Córdoba',
    'Rosario',
    'Mendoza',
    'La Plata',
    'San Miguel de Tucumán',
    'Mar del Plata',
    'Salta',
    'Santa Fe',
    'San Juan',
    'Resistencia',
    'Neuquén',
    'Posadas',
    'Corrientes',
    'Bahía Blanca',
  ],
  'Colombia': [
    'Bogotá',
    'Medellín',
    'Cali',
    'Barranquilla',
    'Cartagena',
    'Cúcuta',
    'Bucaramanga',
    'Pereira',
    'Santa Marta',
    'Ibagué',
    'Manizales',
    'Villavicencio',
    'Pasto',
    'Montería',
    'Neiva',
  ],
};

