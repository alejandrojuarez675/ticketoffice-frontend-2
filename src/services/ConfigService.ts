export class ConfigService {
  private static mocked = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

  static setMocked(value: boolean) {
    this.mocked = value;
  }

  static isMockedEnabled(): boolean {
    return this.mocked;
  }

  static getApiBase(): string {
    return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
  }
}
