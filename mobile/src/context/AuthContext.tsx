import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthApi } from '../api/endpoints';
import { getToken, setToken } from '../api/client';
import { User } from '../api/types';

interface AuthContextValue {
  user: User | null;
  isBootstrapping: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        try {
          const { user: me } = await AuthApi.me();
          setUser(me);
        } catch {
          await setToken(null);
        }
      }
      setIsBootstrapping(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: loggedIn } = await AuthApi.login(email, password);
    await setToken(token);
    setUser(loggedIn);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const { token, user: created } = await AuthApi.register(email, password, name);
    await setToken(token);
    setUser(created);
  }, []);

  const logout = useCallback(async () => {
    await setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isBootstrapping, login, register, logout }),
    [user, isBootstrapping, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
