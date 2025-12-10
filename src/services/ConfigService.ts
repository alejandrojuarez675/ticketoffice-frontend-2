// src/services/ConfigService.ts
export class ConfigService {
  private static sanitizeBase(url?: string | null) {
    const s = (url || '').trim();
    if (!s) return '';
    return s.replace(/^<|>$/g, '');
  }

  static getApiBase() {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    return this.sanitizeBase(raw);
  }

  /**
   * Determina si los mocks están habilitados
   * 
   * Estrategia:
   * - Producción: SIEMPRE false (nunca mocks en prod)
   * - Desarrollo: true por defecto, a menos que NEXT_PUBLIC_USE_MOCKS=false
   * 
   * Para desactivar mocks en desarrollo: NEXT_PUBLIC_USE_MOCKS=false
   */
  static isMockedEnabled(): boolean {
    // En producción: NUNCA usar mocks
    if (process.env.NODE_ENV === 'production') {
      return false;
    }

    // En desarrollo: mocks habilitados por defecto
    // Solo se desactivan si explícitamente se pone 'false'
    const envValue = process.env.NEXT_PUBLIC_USE_MOCKS;
    
    // Si no está definido o está vacío, usar mocks por defecto en dev
    if (envValue === undefined || envValue === '') {
      return true;
    }

    const v = envValue.toLowerCase();
    // Solo desactivar si explícitamente es 'false' o '0'
    return !(v === 'false' || v === '0');
  }

  static getAppUrl() {
    const raw = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return this.sanitizeBase(raw);
  }

  /**
   * Verifica si estamos en modo desarrollo
   */
  static isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  /**
   * Verifica si estamos en modo producción
   */
  static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }
}