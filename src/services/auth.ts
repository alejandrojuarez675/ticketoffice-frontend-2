import { User } from '../types/user';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Administrador',
  },
  {
    id: 2,
    username: 'user',
    password: 'user123',
    role: 'user',
    name: 'Usuario',
  },
];

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(
          (u) => u.username === credentials.username && u.password === credentials.password
        );

        if (!user) {
          reject(new Error('Credenciales inválidas'));
          return;
        }

        const token = `token_${Date.now()}_${Math.random()}`;
        resolve({
          token,
          user,
        });
      }, 1000);
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
