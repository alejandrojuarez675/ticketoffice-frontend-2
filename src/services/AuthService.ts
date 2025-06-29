import { User } from '../types/user';

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
  email: string;
  password: string;
  confirmPassword: string;
}

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

  register: async (credentials: RegisterCredentials): Promise<void> => {
    if (credentials.password !== credentials.confirmPassword) {
      throw new Error('Las contraseñas no coinciden');
    }

    if (mockUsers.some(user => user.username === credentials.username)) {
      throw new Error('El nombre de usuario ya está en uso');
    }

    if (mockUsers.some(user => user.email === credentials.email)) {
      throw new Error('El correo electrónico ya está en uso');
    }

    // Generate a new user ID (in a real app, this would come from the backend)
    const newUser: User = {
      id: mockUsers.length + 1,
      username: credentials.username,
      password: credentials.password, // In a real app, this should be hashed
      email: credentials.email,
      role: 'user',
      name: credentials.username // In a real app, this would be a separate field
    };

    // Add the new user to our mock users array
    mockUsers.push(newUser);

    // In a real app, you would make an API call here
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  },
};
