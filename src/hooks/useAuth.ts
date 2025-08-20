import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/AuthService';
import type { RegisterCredentials, User } from '@/types/user';

export type { User };

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check authentication status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const token = AuthService.getToken(); 

        if (!token) {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setUser(null);
          return;
        }

        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
          setIsAdmin(currentUser.role?.toLowerCase() === 'admin');
        } else {
          AuthService.logout();
          setIsAuthenticated(false);
          setIsAdmin(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
        AuthService.logout();
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (credentials: { username: string; password: string }) => {
    try {
      setIsLoading(true);
      const userData = await AuthService.login(credentials);
      setUser(userData.user);
      setIsAuthenticated(true);
      setIsAdmin(userData.user.role?.toLowerCase() === 'admin'); 
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    router.push('/auth/login');
  }, [router]);

  const register = useCallback(async (userData: RegisterCredentials) => {
    try {
      setIsLoading(true);
      return await AuthService.register(userData);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { user, isAuthenticated, isAdmin, isLoading, login, logout, register };
};

export default useAuth;