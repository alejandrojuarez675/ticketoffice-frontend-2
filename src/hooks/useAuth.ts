'use client';

import { useCallback, useEffect, useState } from 'react';
import { AuthService } from '@/services/AuthService';
import type { RegisterCredentials, User } from '@/types/user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const current = AuthService.getCurrentUser();
    setUser(current);
    const role = current?.role;
    setIsAuthenticated(!!current);
    setIsUser(role === 'user');
    setIsSeller(role === 'seller');
    setIsAdmin(role === 'admin');
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: { username: string; password: string; remember?: boolean }) => {
    const res = await AuthService.login(credentials);
    setUser(res.user);
    const role = res.user.role;
    setIsAuthenticated(true);
    setIsUser(role === 'user');
    setIsSeller(role === 'seller');
    setIsAdmin(role === 'admin');
    return res;
  }, []);

  const logout = useCallback(async () => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setIsUser(false);
    setIsSeller(false);
    setIsAdmin(false);
  }, []);

  const register = useCallback(async (data: RegisterCredentials) => {
    await AuthService.register(data);
  }, []);

  const hasBackofficeAccess = !!user && (user.role === 'seller' || user.role === 'admin');

  return { user, isAuthenticated, isUser, isSeller, isAdmin, hasBackofficeAccess, isLoading, login, logout, register };
}

export default useAuth;