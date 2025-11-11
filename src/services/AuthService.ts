// src/services/AuthService.ts
import { http, setAuthTokenProvider } from '@/lib/http';
import { logger } from '@/lib/logger';
import { ConfigService } from './ConfigService';
import type { BackofficeRole } from '@/config/backofficeNav';
import type { User, LoginCredentials, LoginResponse, RegisterCredentials } from '@/types/user';

type ApiLoginResponse = { token: string; expiresIn: number };
type ApiUserResponse = {
  id: string | number;
  username: string;
  email: string;
  role?: string[]; // ['ADMIN'] | ['SELLER'] | ['USER']
  organizer?: unknown;
};

const MOCK_USERS: User[] = [
  { id: 1, username: 'admin',   password: 'Admin123',  role: 'admin',  name: 'Administrador', email: 'admin@example.com' },
  { id: 2, username: 'seller1', password: 'Seller123', role: 'seller', name: 'Vendedor Uno',  email: 'seller1@example.com' },
  { id: 3, username: 'user1',   password: 'User1234',  role: 'user',   name: 'Usuario Uno',   email: 'user1@example.com'  },
];

class AuthService {
  private static BASE_URL = ConfigService.getApiBase();
  private static TOKEN_KEY = 'auth_token';
  private static USER_KEY = 'user_data';

  private static mapRolesToBackofficeRole(serverRoles?: string[]): BackofficeRole | 'user' {
    const r = (serverRoles || []).map((x) => x.toUpperCase());
    if (r.includes('ADMIN') || r.includes('SUPER_ADMIN')) return 'admin';
    if (r.includes('SELLER') || r.includes('ORGANIZER')) return 'seller';
    return 'user';
  }

  private static toAppUser(api: ApiUserResponse): User {
    const role = this.mapRolesToBackofficeRole(api.role);
    return {
      id: api.id,
      username: api.username,
      email: api.email,
      name: api.username,
      role,
    } as User;
  }

  private static setRoleCookie(role: BackofficeRole | 'user' | null, remember?: boolean) {
    if (typeof document === 'undefined') return;
    const base = 'path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
    if (role) {
      const max = remember ? `; Max-Age=${60 * 60 * 24 * 30}` : '';
      document.cookie = `role=${role}; ${base}${max}`;
    } else {
      document.cookie = `role=; Max-Age=0; ${base}`;
    }
  }

  private static storage(remember?: boolean) {
    if (typeof window === 'undefined') {
      return {
        getItem: (_: string) => null,
        setItem: (_: string, __: string) => {},
        removeItem: (_: string) => {},
        other: { removeItem: (_: string) => {} },
      } as unknown as Storage & { other: Storage };
    }
    const primary = remember ? localStorage : sessionStorage;
    const secondary = remember ? sessionStorage : localStorage;
    return { ...primary, other: secondary } as unknown as Storage & { other: Storage };
  }

  private static persistToken(token: string, remember?: boolean) {
    const store = this.storage(remember);
    store.setItem(this.TOKEN_KEY, token);
    store.other.removeItem(this.TOKEN_KEY);
    setAuthTokenProvider(() => {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem(this.TOKEN_KEY) ?? sessionStorage.getItem(this.TOKEN_KEY);
    });
  }

  private static persistUser(user: User, remember?: boolean) {
    const store = this.storage(remember);
    store.setItem(this.USER_KEY, JSON.stringify(user));
    store.other.removeItem(this.USER_KEY);
  }

  private static clearPersisted() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    setAuthTokenProvider(null);
    this.setRoleCookie(null);
  }

  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    if (ConfigService.isMockedEnabled()) {
      await new Promise((r) => setTimeout(r, 250));
      const u = MOCK_USERS.find(
        (x) => x.username.toLowerCase() === credentials.username.toLowerCase() && x.password === credentials.password
      );
      if (!u) throw new Error('Usuario o contraseña incorrectos');
      const token = `mock_${Date.now()}`;
      const { password, ...safeUser } = u;
      this.persistToken(token, credentials.remember);
      this.persistUser(safeUser, credentials.remember);
      this.setRoleCookie(safeUser.role, credentials.remember);
      return { token, user: safeUser } as LoginResponse;
    }

    const loginUrl = `${this.BASE_URL}/auth/login`;
    const { token } = await http.post<ApiLoginResponse, Omit<LoginCredentials, 'remember'>>(loginUrl, {
      username: credentials.username,
      password: credentials.password,
    });

    this.persistToken(token, credentials.remember);

    const apiUser = await http.get<ApiUserResponse>(`${this.BASE_URL}/users/me`);
    const user = this.toAppUser(apiUser);

    this.persistUser(user, credentials.remember);
    this.setRoleCookie(user.role, credentials.remember);

    logger.info('login successful', { role: user.role, username: user.username });
    return { token, user } as LoginResponse;
  }

  static async register(payload: RegisterCredentials & { remember?: boolean }): Promise<void> {
    if (ConfigService.isMockedEnabled()) {
      await new Promise((r) => setTimeout(r, 300));
      return;
    }
    const url = `${this.BASE_URL}/auth/signup`;
    // BE espera: { username, password, email }
    const res = await http.post<ApiLoginResponse, { username: string; password: string; email: string }>(url, {
      username: payload.username,
      password: payload.password,
      email: payload.email,
    });

    if (res?.token) {
      this.persistToken(res.token, payload.remember);
      const apiUser = await http.get<ApiUserResponse>(`${this.BASE_URL}/users/me`);
      const user = this.toAppUser(apiUser);
      this.persistUser(user, payload.remember);
      this.setRoleCookie(user.role, payload.remember);
    }
  }

  static async me(): Promise<User | null> {
    try {
      const apiUser = await http.get<ApiUserResponse>(`${this.BASE_URL}/users/me`);
      const user = this.toAppUser(apiUser);
      if (typeof window !== 'undefined') {
        const remember = !!localStorage.getItem(this.TOKEN_KEY);
        this.persistUser(user, remember);
        this.setRoleCookie(user.role, remember);
      }
      return user;
    } catch {
      logger.warn('me() failed, clearing session');
      this.clearPersisted();
      return null;
    }
  }

  static logout() {
    this.clearPersisted();
  }

  static getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(this.USER_KEY) ?? sessionStorage.getItem(this.USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
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

  static getRole(): User['role'] | null {
    const u = this.getCurrentUser();
    return u?.role ?? null;
  }
  static isUser(): boolean { return this.getRole() === 'user'; }
  static isSeller(): boolean { return this.getRole() === 'seller'; }
  static isAdmin(): boolean { return this.getRole() === 'admin'; }
  static hasBackofficeAccess(): boolean { return ['seller', 'admin'].includes(this.getRole() || ''); }

  // No-MVP stubs
  static async verifyEmail(_: string): Promise<void> { throw new Error('Función no disponible en el MVP'); }
  static async checkAvailability(_: { username?: string; email?: string }): Promise<{ usernameAvailable?: boolean; emailAvailable?: boolean }> {
    throw new Error('Función no disponible en el MVP');
  }
  static async requestPasswordReset(_: string): Promise<void> { throw new Error('Función no disponible en el MVP'); }
  static async resetPassword(_: string, __: string): Promise<void> { throw new Error('Función no disponible en el MVP'); }
}

export { AuthService };
