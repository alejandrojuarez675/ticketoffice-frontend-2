import type { User, LoginCredentials, LoginResponse, RegisterCredentials } from '@/types/user';
import { ConfigService } from './ConfigService';

const MOCK_USERS: User[] = [
  { id: 1, username: 'admin',   password: 'Admin123',  role: 'admin',  name: 'Administrador', email: 'admin@example.com' },
  { id: 2, username: 'seller1', password: 'Seller123', role: 'seller', name: 'Vendedor Uno',  email: 'seller1@example.com' },
  { id: 3, username: 'user1',   password: 'User1234',  role: 'user',   name: 'Usuario Uno',   email: 'user1@example.com'  },
];

class AuthService {
  private static BASE_URL = ConfigService.getApiBase();
  private static TOKEN_KEY = 'auth_token';
  private static USER_KEY = 'user_data';
  private static AUTH_PREFIX = '/api/public/v1/auth';

  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    if (ConfigService.isMockedEnabled()) {
      await new Promise((r) => setTimeout(r, 350));
      const u = MOCK_USERS.find(
        (x) => x.username.toLowerCase() === credentials.username.toLowerCase() && x.password === credentials.password
      );
      if (!u) throw new Error('Usuario o contraseña incorrectos');
      const token = `mock_${Date.now()}`;
      const { password, ...safeUser } = u;
      this.setAuthData({ token, user: safeUser }, credentials.remember);
      return { token, user: safeUser };
    }

    const res = await fetch(`${this.BASE_URL}${this.AUTH_PREFIX}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) throw new Error('Usuario o contraseña incorrectos');
    const data = (await res.json()) as LoginResponse;
    this.setAuthData(data, credentials.remember);
    return data;
  }

  static async register(payload: RegisterCredentials & { captchaToken?: string }): Promise<void> {
    if (ConfigService.isMockedEnabled()) {
      await new Promise((r) => setTimeout(r, 400));
      // Mock: no persistimos, el BE real debe crear con role "user" por defecto
      return;
    }
    const res = await fetch(`${this.BASE_URL}${this.AUTH_PREFIX}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'No se pudo registrar');
    }
  }

  static async verifyEmail(token: string): Promise<void> {
    if (ConfigService.isMockedEnabled()) {
      await new Promise((r) => setTimeout(r, 300));
      if (!token) throw new Error('Token inválido');
      return;
    }
    const res = await fetch(`${this.BASE_URL}${this.AUTH_PREFIX}/verify?token=${encodeURIComponent(token)}`, { method: 'GET' });
    if (!res.ok) throw new Error('No se pudo verificar el correo');
  }

  static async checkAvailability(params: { username?: string; email?: string }): Promise<{ usernameAvailable?: boolean; emailAvailable?: boolean }> {
    if (ConfigService.isMockedEnabled()) {
      await new Promise((r) => setTimeout(r, 300));
      const takenUsers = MOCK_USERS.map(u => u.username.toLowerCase());
      const takenEmails = MOCK_USERS.map(u => u.email.toLowerCase());
      return {
        usernameAvailable: params.username ? !takenUsers.includes((params.username || '').toLowerCase()) : undefined,
        emailAvailable: params.email ? !takenEmails.includes((params.email || '').toLowerCase()) : undefined,
      };
    }
    const qs = new URLSearchParams(params as any).toString();
    const res = await fetch(`${this.BASE_URL}${this.AUTH_PREFIX}/availability?${qs}`, { headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error('No se pudo verificar disponibilidad');
    return res.json();
  }

  static logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.USER_KEY);
    }
  }

  static getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(this.USER_KEY) ?? sessionStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY) ?? sessionStorage.getItem(this.TOKEN_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static getAuthHeader(): Record<string, string> {
    const t = this.getToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  // Helpers de rol
  static getRole(): User['role'] | null {
    const u = this.getCurrentUser();
    return u?.role ?? null;
  }

  static isUser(): boolean {
    return this.getRole() === 'user';
  }

  static isSeller(): boolean {
    return this.getRole() === 'seller';
  }

  static isAdmin(): boolean {
    const r = this.getRole();
    return r === 'admin' ;
  }

  static hasBackofficeAccess(): boolean {
    const r = this.getRole();
    return r === 'seller' || r === 'admin';
  }

  private static setAuthData(data: { token: string; user: User }, remember?: boolean) {
    if (typeof window === 'undefined') return;
    const storage = remember ? localStorage : sessionStorage;
    const other = remember ? sessionStorage : localStorage;
    storage.setItem(this.TOKEN_KEY, data.token);
    storage.setItem(this.USER_KEY, JSON.stringify(data.user));
    other.removeItem(this.TOKEN_KEY);
    other.removeItem(this.USER_KEY);
  }

  static async requestPasswordReset(email: string): Promise<void> {
    if (ConfigService.isMockedEnabled()) {
      await new Promise((r) => setTimeout(r, 500));
      return;
    }
    const res = await fetch(`${this.BASE_URL}${this.AUTH_PREFIX}/forgot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('No se pudo procesar la solicitud');
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    if (ConfigService.isMockedEnabled()) {
      await new Promise((r) => setTimeout(r, 500));
      return;
    }
    const res = await fetch(`${this.BASE_URL}${this.AUTH_PREFIX}/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    if (!res.ok) throw new Error('No se pudo restablecer la contraseña');
  }
}

export { AuthService };