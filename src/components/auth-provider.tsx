'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { getSession, type AuthSession } from '@/lib/auth';

interface AuthContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  isLoading: true,
  refresh: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const s = await getSession();
    setSession(s);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getSession().then((s) => {
      if (!cancelled) {
        setSession(s);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <AuthContext value={{ session, isLoading, refresh }}>
      {children}
    </AuthContext>
  );
}
