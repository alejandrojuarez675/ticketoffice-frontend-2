import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/AuthService';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
}

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
        const token = localStorage.getItem('token');
        
        if (!token) {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setUser(null);
          return;
        }

        // In a real app, you might want to validate the token with the server
        // For now, we'll just check if it exists
        const currentUser = AuthService.getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
          setIsAdmin(currentUser.role === 'ADMIN');
        } else {
          // If token exists but user data is not available, clear the token
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
      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(userData.role === 'ADMIN');
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

  const register = useCallback(async (userData: {
    username: string;
    email: string;
    password: string;
    name: string;
  }) => {
    try {
      setIsLoading(true);
      const newUser = await AuthService.register(userData);
      return newUser;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    login,
    logout,
    register,
  };
};

export default useAuth;
