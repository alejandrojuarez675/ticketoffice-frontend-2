// src/services/ConfigService.ts

// URL de producción hardcodeada como fallback seguro
const PRODUCTION_API_URL = 'https://yscqvjs2zg.us-east-1.awsapprunner.com';
const LOCAL_API_URL = 'http://localhost:8080';

export class ConfigService {
  private static sanitizeBase(url?: string | null) {
    const s = (url || '').trim();
    if (!s) return '';
    // Limpiar caracteres inválidos que podrían venir de configs mal formateadas
    return s.replace(/^<|>$/g, '').replace(/['"`]/g, '');
  }

  /**
   * Obtiene la URL base de la API
   * 
   * Estrategia:
   * - Si existe NEXT_PUBLIC_API_BASE_URL, usarla
   * - En producción: usar URL de producción hardcodeada como fallback
   * - En desarrollo: usar localhost como fallback
   */
  static getApiBase() {
    const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    // Si hay variable de entorno, usarla
    if (envUrl && envUrl.trim()) {
      return this.sanitizeBase(envUrl);
    }
    
    // Fallback según ambiente
    if (this.isProduction()) {
      // En producción SIEMPRE usar la URL de producción
      return PRODUCTION_API_URL;
    }
    
    // En desarrollo usar localhost
    return LOCAL_API_URL;
  }

  /**
   * Log de configuración actual (para debugging)
   * Solo ejecuta en cliente y en desarrollo
   */
  static logConfig() {
    if (typeof window === 'undefined') return;
    if (this.isProduction()) return;
    
    console.group('🔧 ConfigService');
    console.log('API Base:', this.getApiBase());
    console.log('App URL:', this.getAppUrl());
    console.log('Mocks:', this.isMockedEnabled() ? 'Habilitados' : 'Deshabilitados');
    console.log('Ambiente:', this.isProduction() ? 'Producción' : 'Desarrollo');
    console.log('ENV NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL || '(no definida)');
    console.groupEnd();
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