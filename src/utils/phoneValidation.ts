// src/utils/phoneValidation.ts

/**
 * Configuración de validación de teléfonos por país
 * Incluye código de país, regex de validación y formato esperado
 */
export interface PhoneValidationConfig {
  countryCode: string;
  prefix: string;
  regex: RegExp;
  format: string;
  minLength: number;
  maxLength: number;
  placeholder: string;
}

export const PHONE_CONFIGS: Record<string, PhoneValidationConfig> = {
  ARG: {
    countryCode: 'ARG',
    prefix: '+54',
    regex: /^(\+54)?[\s]?(9)?[\s]?([1-9]\d{1,3})[\s-]?(\d{6,8})$/,
    format: '+54 9 XXXX XXXXXX',
    minLength: 10,
    maxLength: 13,
    placeholder: 'Ej: 11 1234 5678',
  },
  COL: {
    countryCode: 'COL',
    prefix: '+57',
    regex: /^(\+57)?[\s]?(3\d{2})[\s-]?(\d{3})[\s-]?(\d{4})$/,
    format: '+57 3XX XXX XXXX',
    minLength: 10,
    maxLength: 12,
    placeholder: 'Ej: 314 542 9669',
  },
  OTHER: {
    countryCode: 'OTHER',
    prefix: '',
    regex: /^\+?[\d\s-]{7,15}$/,
    format: 'Número internacional',
    minLength: 7,
    maxLength: 15,
    placeholder: 'Ej: +1 234 567 8900',
  },
};

/**
 * Obtiene la configuración de validación de teléfono para un país
 */
export function getPhoneConfig(countryCode: string): PhoneValidationConfig {
  return PHONE_CONFIGS[countryCode] || PHONE_CONFIGS.OTHER;
}

/**
 * Valida un número de teléfono según el país
 * @returns null si es válido, mensaje de error si no lo es
 */
export function validatePhone(phone: string, countryCode: string): string | null {
  if (!phone || phone.trim() === '') {
    return 'El teléfono es requerido';
  }

  const cleanPhone = phone.replace(/[\s-]/g, '');
  const config = getPhoneConfig(countryCode);

  // Validar longitud
  if (cleanPhone.length < config.minLength) {
    return `El teléfono debe tener al menos ${config.minLength} dígitos`;
  }

  if (cleanPhone.length > config.maxLength) {
    return `El teléfono no debe exceder ${config.maxLength} dígitos`;
  }

  // Validar formato
  if (!config.regex.test(phone)) {
    return `Formato inválido. ${config.format}`;
  }

  return null;
}

/**
 * Formatea un número de teléfono para mostrar
 */
export function formatPhoneDisplay(phone: string, countryCode: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (countryCode === 'ARG' && cleanPhone.length >= 10) {
    // Formato argentino: XX XXXX XXXX
    const area = cleanPhone.slice(0, 2);
    const first = cleanPhone.slice(2, 6);
    const second = cleanPhone.slice(6, 10);
    return `${area} ${first} ${second}`;
  }
  
  if (countryCode === 'COL' && cleanPhone.length >= 10) {
    // Formato colombiano: 3XX XXX XXXX
    const first = cleanPhone.slice(0, 3);
    const second = cleanPhone.slice(3, 6);
    const third = cleanPhone.slice(6, 10);
    return `${first} ${second} ${third}`;
  }
  
  return phone;
}
