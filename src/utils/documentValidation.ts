// src/utils/documentValidation.ts
import type { DocumentTypeDto } from '@/services/RegionService';

/**
 * Configuraciones de validación de documento por defecto (fallback)
 */
const DEFAULT_DOCUMENT_CONFIGS: Record<string, { regex: RegExp; format: string; minLength: number; maxLength: number }> = {
  DNI: {
    regex: /^\d{7,8}$/,
    format: 'Solo números, 7-8 dígitos',
    minLength: 7,
    maxLength: 8,
  },
  CC: {
    regex: /^\d{6,10}$/,
    format: 'Solo números, 6-10 dígitos',
    minLength: 6,
    maxLength: 10,
  },
  CE: {
    regex: /^\d{6,10}$/,
    format: 'Solo números, 6-10 dígitos',
    minLength: 6,
    maxLength: 10,
  },
  TI: {
    regex: /^\d{10,11}$/,
    format: 'Solo números, 10-11 dígitos',
    minLength: 10,
    maxLength: 11,
  },
  PASSPORT: {
    regex: /^[A-Z0-9]{6,12}$/i,
    format: 'Letras y números, 6-12 caracteres',
    minLength: 6,
    maxLength: 12,
  },
  OTHER: {
    regex: /^[A-Z0-9]{4,20}$/i,
    format: 'Letras y números, 4-20 caracteres',
    minLength: 4,
    maxLength: 20,
  },
};

/**
 * Valida un número de documento según el tipo y la configuración del backend
 * @param document - Número de documento
 * @param documentType - Tipo de documento (DNI, CC, PASSPORT, etc.)
 * @param documentTypeConfig - Configuración del tipo de documento desde el backend (opcional)
 * @returns null si es válido, mensaje de error si no lo es
 */
export function validateDocument(
  document: string,
  documentType: string,
  documentTypeConfig?: DocumentTypeDto
): string | null {
  if (!document || document.trim() === '') {
    return 'El número de documento es requerido';
  }

  const cleanDoc = document.trim().toUpperCase();

  // Si tenemos configuración del backend con regex, usarla
  if (documentTypeConfig?.regex) {
    try {
      const regex = new RegExp(documentTypeConfig.regex);
      if (!regex.test(cleanDoc)) {
        return documentTypeConfig.format 
          ? `Formato inválido. Esperado: ${documentTypeConfig.format}`
          : 'El número de documento no es válido';
      }
      return null;
    } catch {
      // Si el regex del backend es inválido, usar fallback
    }
  }

  // Fallback a configuración por defecto
  const config = DEFAULT_DOCUMENT_CONFIGS[documentType] || DEFAULT_DOCUMENT_CONFIGS.OTHER;

  if (cleanDoc.length < config.minLength) {
    return `El documento debe tener al menos ${config.minLength} caracteres`;
  }

  if (cleanDoc.length > config.maxLength) {
    return `El documento no debe exceder ${config.maxLength} caracteres`;
  }

  if (!config.regex.test(cleanDoc)) {
    return `Formato inválido. ${config.format}`;
  }

  return null;
}

/**
 * Obtiene el placeholder para un tipo de documento
 */
export function getDocumentPlaceholder(documentType: string): string {
  const placeholders: Record<string, string> = {
    DNI: 'Ej: 12345678',
    CC: 'Ej: 1234567890',
    CE: 'Ej: 1234567890',
    TI: 'Ej: 12345678901',
    PASSPORT: 'Ej: ABC123456',
    OTHER: 'Número de documento',
  };
  return placeholders[documentType] || placeholders.OTHER;
}
