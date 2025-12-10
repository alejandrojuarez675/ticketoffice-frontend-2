// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginCredentials, RegisterCredentials } from '@/types/user';
import { AuthService } from '@/services/AuthService';

type RegisterData = RegisterCredentials & { remember?: boolean };

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasBackofficeAccess: boolean;
  login: (credentials: { username: string; password: string; remember?: boolean }) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(AuthService.getCurrentUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const hasBackofficeAccess = useMemo(() => {
    if (!user) return false;
    return ['admin', 'seller', 'superadmin'].includes(user.role || '');
  }, [user]);

  const refresh = async () => {
    try {
      setIsLoading(true);
      const u = await AuthService.me();
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    await AuthService.login(credentials);
    const u = AuthService.getCurrentUser();
    setUser(u);
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const register = async (data: RegisterData) => {
    // MVP: sólo crea cuenta; el flujo de UI decide si redirige a login o hace autologin
    await AuthService.register({
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      acceptTerms: data.acceptTerms,
      remember: data.remember
    });
    // si el BE devolvió token y AuthService guardó usuario, sincronizamos
    const u = AuthService.getCurrentUser();
    if (u) setUser(u);
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      hasBackofficeAccess,
      login,
      logout,
      register,
      refresh,
    }),
    [user, isLoading, hasBackofficeAccess]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return ctx;
};

export { AuthContext };
