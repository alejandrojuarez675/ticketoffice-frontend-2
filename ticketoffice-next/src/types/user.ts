export interface User {
  id: number;
  username: string;
  password?: string; // Optional since we might not want to expose it everywhere
  email: string;
  role: 'admin' | 'user';
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterCredentials {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}
