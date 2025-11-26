// src/services/ConfigService.ts
export class ConfigService {
  private static sanitizeBase(url?: string | null) {
    const s = (url || '').trim();
    if (!s) return '';
    return s.replace(/^<|>$/g, '');
  }

  static getApiBase() {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL || '<http://localhost:8080>';
    return this.sanitizeBase(raw);
  }
  static isMockedEnabled() {
    const v = (process.env.NEXT_PUBLIC_USE_MOCKS || 'false').toLowerCase();
    return v === 'true' || v === '1';
  }
  static getAppUrl() {
    const raw = process.env.NEXT_PUBLIC_APP_URL || '<http://localhost:3000>';
    return this.sanitizeBase(raw);
  }
}