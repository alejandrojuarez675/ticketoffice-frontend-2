import type { User, LoginCredentials, LoginResponse, RegisterCredentials } from '@/types/user';
import { ConfigService } from './ConfigService';
import { mockLogin, mockRegister } from '@/mocks';

class AuthService {
  private static BASE_URL = ConfigService.getApiBase();
  private static TOKEN_KEY = 'auth_token';
  private static USER_KEY = 'user_data';
  private static AUTH_PREFIX = '/api/public/v1/auth'; // ajustar cuando haya BE real

  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    if (ConfigService.isMockedEnabled()) {
      const data = await mockLogin(credentials);
      this.setAuthData(data);
      return data;
    }

    const response = await fetch(`${this.BASE_URL}${this.AUTH_PREFIX}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`[${response.status}] ${text}`);
    }
    const data = await response.json();
    this.setAuthData(data);
    return data;
  }

  static async register(credentials: RegisterCredentials): Promise<void> {
    if (ConfigService.isMockedEnabled()) {
      return mockRegister(credentials);
    }

    const response = await fetch(`${this.BASE_URL}${this.AUTH_PREFIX}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`[${response.status}] ${text}`);
    }
  }

  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  static getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  static isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  static getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private static setAuthData(data: { token: string; user: User }): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, data.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
    }
  }
}

export { AuthService };