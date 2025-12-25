import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DatabaseService, type StaffUser } from '../lib/supabase';

interface AuthContextType {
  user: StaffUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'aayush_hms_auth_user';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const freshUser = await DatabaseService.getStaffUserById(parsedUser.id);

        if (freshUser && freshUser.is_active) {
          setUser(freshUser);
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const authenticatedUser = await DatabaseService.authenticateStaffUser(username, password);

      if (!authenticatedUser) {
        throw new Error('Invalid username or password');
      }

      if (!authenticatedUser.is_active) {
        throw new Error('Account is inactive. Please contact administrator.');
      }

      setUser(authenticatedUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
