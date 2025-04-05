'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './supabase';
import { Session, User } from './types';
import { setCookie, deleteCookie } from 'cookies-next';

interface AuthContextType {
  session: Session;
  login: (username: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const defaultSession: Session = {
  user: null,
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextType>({
  session: defaultSession,
  login: async () => ({ success: false }),
  logout: () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(defaultSession);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check for existing session
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setSession({
          user,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        deleteCookie('authenticated');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, pin: string) => {
    try {
      setLoading(true);
      
      // Case insensitive username matching
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('username', username.toLowerCase())
        .single();
      
      if (error || !data) {
        return { success: false, error: 'Invalid username or PIN' };
      }

      // Simple PIN comparison (in a real app, you'd use proper password hashing)
      if (data.pin !== pin) {
        return { success: false, error: 'Invalid username or PIN' };
      }

      const user: User = {
        id: data.id,
        username: data.username,
        name: data.name,
        role: data.role,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      // Save user to local storage
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set auth cookie for middleware (30 day expiry)
      setCookie('authenticated', 'true', { maxAge: 60 * 60 * 24 * 30 });
      
      // Update session state
      setSession({
        user,
        isAuthenticated: true,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    deleteCookie('authenticated');
    setSession(defaultSession);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ session, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
} 