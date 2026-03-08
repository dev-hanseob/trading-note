'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { AuthUser } from '@/type/domain/auth';
import { getMe, login as apiLogin, signup as apiSignup, logout as apiLogout, getStoredToken, removeToken } from '@/lib/api/auth';
import { LoginRequest, SignupRequest } from '@/type/domain/auth';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (request: LoginRequest) => Promise<void>;
  signup: (request: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      removeToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (request: LoginRequest) => {
    await apiLogin(request);
    await refreshUser();
  }, [refreshUser]);

  const signup = useCallback(async (request: SignupRequest) => {
    await apiSignup(request);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
