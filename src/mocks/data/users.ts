import { User, LoginCredentials, LoginResponse, RegisterCredentials } from '@/types/user';

export const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Administrador',
    email: 'admin@example.com',
  },
  {
    id: 2,
    username: 'user',
    password: 'user123',
    role: 'user',
    name: 'Usuario',
    email: 'user@example.com',
  },
];

export async function mockLogin(credentials: LoginCredentials): Promise<LoginResponse> {
  await new Promise((r) => setTimeout(r, 400));
  const user = mockUsers.find(
    (u) => u.username === credentials.username && u.password === credentials.password
  );
  if (!user) {
    throw new Error('Credenciales inválidas');
  }
  const token = `mock_token_${Date.now()}`;
  const { password, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
}

export async function mockRegister(credentials: RegisterCredentials): Promise<void> {
  await new Promise((r) => setTimeout(r, 400));

  if (credentials.password !== credentials.confirmPassword) {
    throw new Error('Las contraseñas no coinciden');
  }
  if (mockUsers.some((u) => u.username === credentials.username)) {
    throw new Error('El nombre de usuario ya está en uso');
  }
  if (mockUsers.some((u) => u.email === credentials.email)) {
    throw new Error('El correo electrónico ya está en uso');
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
}