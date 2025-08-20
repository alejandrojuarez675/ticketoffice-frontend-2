import { User, LoginCredentials, LoginResponse, RegisterCredentials } from '@/types/user';
import { ConfigService } from './ConfigService';

// Mock data for development
const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Administrador',
    email: 'admin@example.com'
  },
  {
    id: 2,
    username: 'user',
    password: 'user123',
    role: 'user',
    name: 'Usuario',
    email: 'user@example.com'
  },
];

class AuthService {
  private static BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  private static TOKEN_KEY = 'auth_token';
  private static USER_KEY = 'user_data';

  /**
   * Logs in a user with the provided credentials
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    if (ConfigService.isMockedEnabled()) {
      return this.mockLogin(credentials);
    }

    try {
      const response = await fetch(`${this.BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al iniciar sesión');
      }

      const data = await response.json();
      this.setAuthData(data);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Registers a new user
   */
  static async register(credentials: RegisterCredentials): Promise<void> {
    if (ConfigService.isMockedEnabled()) {
      return this.mockRegister(credentials);
    }

    try {
      const response = await fetch(`${this.BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar el usuario');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Logs out the current user
   */
  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  /**
   * Gets the current authenticated user
   */
  static getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Gets the current authentication token
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Checks if the user is authenticated
   */
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Checks if the current user has admin role
   */
  static isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  // Private helper methods
  private static setAuthData(data: { token: string; user: User }): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, data.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
    }
  }

  // Mock implementation for development
  private static async mockLogin(credentials: LoginCredentials): Promise<LoginResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(
          (u) => u.username === credentials.username && u.password === credentials.password
        );

        if (!user) {
          reject(new Error('Credenciales inválidas'));
          return;
        }

        const token = `mock_token_${Date.now()}`;
        const { password, ...userWithoutPassword } = user;
        const response = {
          token,
          user: userWithoutPassword,
        };

        this.setAuthData(response);
        resolve(response);
      }, 500); // Simulate network delay
    });
  }

  // Mock implementation for development
  private static async mockRegister(credentials: RegisterCredentials): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.password !== credentials.confirmPassword) {
          reject(new Error('Las contraseñas no coinciden'));
          return;
        }

        if (mockUsers.some(user => user.username === credentials.username)) {
          reject(new Error('El nombre de usuario ya está en uso'));
          return;
        }

        if (mockUsers.some(user => user.email === credentials.email)) {
          reject(new Error('El correo electrónico ya está en uso'));
          return;
        }

        const newUser: User = {
          id: mockUsers.length + 1,
          username: credentials.username,
          password: credentials.password,
          email: credentials.email,
          role: 'user',
          name: credentials.firstName || credentials.username,
        };

        mockUsers.push(newUser);
        resolve();
      }, 500); // Simulate network delay
    });
  }

  static getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}


export { AuthService };
