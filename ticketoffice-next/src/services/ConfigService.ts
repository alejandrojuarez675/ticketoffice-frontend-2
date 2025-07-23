export class ConfigService {
  private static isMocked: boolean = true; // Default to mocked for now

  static setMocked(value: boolean) {
    this.isMocked = value;
  }

  static isMockedEnabled(): boolean {
    // In Next.js, we can also check environment variables
    return this.isMocked || process.env.NEXT_PUBLIC_USE_MOCK === 'true';
  }
}
