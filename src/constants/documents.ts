/**
 * [F1-007] Constantes de tipos de documento
 * 
 * GUÍA: Tipos de documento soportados por país
 * 
 * Uso:
 * ```tsx
 * import { DOCUMENT_TYPES } from '@/constants/documents';
 * 
 * DOCUMENT_TYPES.map(doc => <MenuItem key={doc.value} value={doc.value}>{doc.label}</MenuItem>)
 * ```
 */

export interface DocumentType {
  value: string;
  label: string;
  countries?: string[]; // Si undefined, aplica a todos
}

// Tipos de documento disponibles en el checkout
export const DOCUMENT_TYPES: DocumentType[] = [
  { value: 'DNI', label: 'DNI', countries: ['Argentina'] },
  { value: 'CC', label: 'Cédula de Ciudadanía', countries: ['Colombia'] },
  { value: 'CE', label: 'Cédula de Extranjería', countries: ['Colombia'] },
  { value: 'TI', label: 'Tarjeta de Identidad', countries: ['Colombia'] },
  { value: 'PASSPORT', label: 'Pasaporte' },
  { value: 'OTHER', label: 'Otro' },
];

// Obtener tipos de documento para un país específico
export function getDocumentTypesForCountry(country?: string): DocumentType[] {
  if (!country) return DOCUMENT_TYPES;
  
  return DOCUMENT_TYPES.filter(
    doc => !doc.countries || doc.countries.includes(country)
  );
}

// Valores por defecto según país
export const DEFAULT_DOCUMENT_TYPE: Record<string, string> = {
  'Argentina': 'DNI',
  'Colombia': 'CC',
};

export function getDefaultDocumentType(country?: string): string {
  return DEFAULT_DOCUMENT_TYPE[country || ''] || 'PASSPORT';
}

