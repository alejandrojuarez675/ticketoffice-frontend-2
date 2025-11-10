
export interface User {
  id: number;
  username: string;
  password?: string;
  email: string;
  role: 'user' | 'seller' | 'admin';
  name: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  remember?: boolean; 
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  confirmPassword?: string;
  acceptTerms?: boolean;
}
