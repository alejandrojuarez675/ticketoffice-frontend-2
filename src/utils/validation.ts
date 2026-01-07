// src/utils/validation.ts

/**
 * Valida si un string es un UUID v4 válido
 * Formato: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function isValidUUID(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Valida si un string es un ID válido (UUID o formato alfanumérico seguro)
 * Permite UUIDs y IDs alfanuméricos de al menos 8 caracteres
 */
export function isValidId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  
  // Primero verificar si es UUID
  if (isValidUUID(id)) return true;
  
  // Permitir IDs alfanuméricos de al menos 8 caracteres (sin caracteres especiales peligrosos)
  const safeIdRegex = /^[a-zA-Z0-9_-]{8,}$/;
  return safeIdRegex.test(id);
}

/**
 * Valida si un string parece ser un slug válido (para rutas públicas)
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  // Slugs: letras minúsculas, números, guiones. Min 2 caracteres
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slug.length >= 2 && slugRegex.test(slug);
}

/**
 * Sanitiza un ID removiendo caracteres potencialmente peligrosos
 */
export function sanitizeId(id: string): string {
  if (!id || typeof id !== 'string') return '';
  return id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
}
