/**
 * Utilidades de sanitización de inputs para seguridad
 * 
 * GUÍA: Usar estas funciones para sanitizar datos de entrada
 * antes de enviarlos al backend o mostrarlos en la UI.
 */

/**
 * Escapa caracteres HTML peligrosos para prevenir XSS
 * @param str - String a escapar
 * @returns String con caracteres HTML escapados
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };
  
  return str.replace(/[&<>"'`=/]/g, (char) => htmlEscapes[char] || char);
}

/**
 * Elimina etiquetas HTML de un string
 * @param str - String con posibles tags HTML
 * @returns String limpio sin tags HTML
 */
export function stripHtmlTags(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Sanitiza un string para uso general
 * - Elimina tags HTML
 * - Recorta espacios en blanco
 * - Normaliza espacios múltiples
 * @param str - String a sanitizar
 * @returns String sanitizado
 */
export function sanitizeString(str: string): string {
  if (!str || typeof str !== 'string') return '';
  
  return stripHtmlTags(str)
    .trim()
    .replace(/\s+/g, ' '); // Normaliza espacios múltiples
}

/**
 * Sanitiza un email
 * - Convierte a minúsculas
 * - Recorta espacios
 * - Valida formato básico
 * @param email - Email a sanitizar
 * @returns Email sanitizado o string vacío si es inválido
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  
  const cleaned = email.trim().toLowerCase();
  
  // Validación básica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleaned)) return '';
  
  return cleaned;
}

/**
 * Sanitiza un nombre de usuario
 * - Solo permite letras, números, punto y guion bajo
 * - Recorta espacios
 * @param username - Username a sanitizar
 * @returns Username sanitizado
 */
export function sanitizeUsername(username: string): string {
  if (!username || typeof username !== 'string') return '';
  
  return username
    .trim()
    .replace(/[^a-zA-Z0-9._]/g, '');
}

/**
 * Sanitiza un número de teléfono
 * - Solo permite dígitos y el símbolo +
 * @param phone - Teléfono a sanitizar
 * @returns Teléfono sanitizado
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Sanitiza un número de documento
 * - Solo permite letras y números
 * @param document - Documento a sanitizar
 * @returns Documento sanitizado
 */
export function sanitizeDocument(document: string): string {
  if (!document || typeof document !== 'string') return '';
  
  return document.trim().replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Sanitiza una URL
 * - Verifica que comience con http:// o https://
 * - Recorta espacios
 * @param url - URL a sanitizar
 * @returns URL sanitizada o string vacío si es inválida
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  
  const cleaned = url.trim();
  
  // Debe comenzar con http:// o https://
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    return '';
  }
  
  try {
    new URL(cleaned); // Valida que sea una URL válida
    return cleaned;
  } catch {
    return '';
  }
}

/**
 * Sanitiza un número positivo
 * @param value - Valor a sanitizar
 * @param defaultValue - Valor por defecto si no es válido
 * @returns Número positivo o el valor por defecto
 */
export function sanitizePositiveNumber(value: unknown, defaultValue = 0): number {
  const num = Number(value);
  if (isNaN(num) || num < 0) return defaultValue;
  return num;
}

/**
 * Sanitiza un entero positivo
 * @param value - Valor a sanitizar
 * @param defaultValue - Valor por defecto si no es válido
 * @returns Entero positivo o el valor por defecto
 */
export function sanitizePositiveInteger(value: unknown, defaultValue = 0): number {
  const num = Math.floor(Number(value));
  if (isNaN(num) || num < 0) return defaultValue;
  return num;
}

/**
 * Sanitiza datos de un formulario de comprador
 * @param data - Datos del comprador
 * @returns Datos sanitizados
 */
export function sanitizeBuyerData(data: {
  name?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  documentType?: string;
  document?: string;
}): typeof data {
  return {
    name: sanitizeString(data.name || ''),
    lastName: sanitizeString(data.lastName || ''),
    email: sanitizeEmail(data.email || ''),
    phone: sanitizePhone(data.phone || ''),
    nationality: sanitizeString(data.nationality || ''),
    documentType: sanitizeString(data.documentType || ''),
    document: sanitizeDocument(data.document || ''),
  };
}

/**
 * Sanitiza datos de un evento antes de enviarlo al backend
 * @param event - Datos del evento
 * @returns Datos sanitizados
 */
export function sanitizeEventData(event: {
  title?: string;
  description?: string;
  location?: {
    name?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  image?: {
    url?: string;
    alt?: string;
  };
}): typeof event {
  return {
    title: sanitizeString(event.title || ''),
    description: sanitizeString(event.description || ''),
    location: event.location ? {
      name: sanitizeString(event.location.name || ''),
      address: sanitizeString(event.location.address || ''),
      city: sanitizeString(event.location.city || ''),
      country: sanitizeString(event.location.country || ''),
    } : undefined,
    image: event.image ? {
      url: sanitizeUrl(event.image.url || '') || event.image.url || '',
      alt: sanitizeString(event.image.alt || ''),
    } : undefined,
  };
}

