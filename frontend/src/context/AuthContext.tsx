import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, RoleCode } from '../types/index.js';
import { authService } from '../services/authService.js';
import { apiClient } from '../services/apiClient.js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (role: RoleCode) => boolean;
  hasAnyRole: (roles: RoleCode[]) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const restoreSession = useCallback(async () => {
    const token = apiClient.getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const { user: fetchedUser } = await authService.getMe();
      setUser(fetchedUser);
    } catch {
      // Token expired or invalid
      apiClient.setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async (email: string, password: string, role?: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password, role);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const { user: updatedUser } = await authService.getMe();
      setUser(updatedUser);
    } catch {
      // ignore
    }
  };

  const hasRole = (role: RoleCode): boolean => {
    return !!user?.roles?.includes(role);
  };

  const hasAnyRole = (roles: RoleCode[]): boolean => {
    return !!user?.roles?.some((r) => roles.includes(r));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
        hasRole,
        hasAnyRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
