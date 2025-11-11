// src/services/ConfigService.ts
export class ConfigService {
  static getApiBase() {
    return process.env.NEXT_PUBLIC_API_BASE_URL || '<http://localhost:8080>';
  }
  static isMockedEnabled() {
    const v = (process.env.NEXT_PUBLIC_USE_MOCKS || 'false').toLowerCase();
    return v === 'true' || v === '1';
  }
  static getAppUrl() {
    return process.env.NEXT_PUBLIC_APP_URL || '<http://localhost:3000>';
  }
}