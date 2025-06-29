export class ConfigService {
  private static isMocked: boolean = false;

  static setMocked(value: boolean) {
    this.isMocked = value;
  }

  static isMockedEnabled(): boolean {
    return this.isMocked;
  }
}
