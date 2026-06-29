import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, TokenStore } from '../lib/api';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  status: string;
  permissions?: string[];
  lastLogin?: string;
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const { accessToken, refreshToken, admin } = res.data;
      TokenStore.setTokens(accessToken, refreshToken);
      localStorage.setItem('admin_user', JSON.stringify(admin));
      setUser(admin);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // silent
    } finally {
      TokenStore.clear();
      setUser(null);
    }
  }, []);

  // Re-validate token on mount
  useEffect(() => {
    if (TokenStore.getAccess() && !user) {
      authApi.getMe()
        .then(res => {
          setUser(res.data);
          localStorage.setItem('admin_user', JSON.stringify(res.data));
        })
        .catch(() => {
          TokenStore.clear();
          setUser(null);
        });
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
      isSuperAdmin: user?.role === 'SUPER_ADMIN',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
