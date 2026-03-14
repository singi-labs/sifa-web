'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { getSession, type AuthSession } from '@/lib/auth';

const SESSION_CACHE_KEY = 'sifa:session';

function getCachedSession(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

function setCachedSession(session: AuthSession | null): void {
  try {
    if (session) {
      sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(SESSION_CACHE_KEY);
    }
  } catch {
    // sessionStorage unavailable (SSR, private browsing edge cases)
  }
}

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
  const [session, setSession] = useState<AuthSession | null>(() => getCachedSession());
  const [isLoading, setIsLoading] = useState(() => getCachedSession() === null);

  const refresh = useCallback(async () => {
    if (!session) setIsLoading(true);
    const s = await getSession();
    setSession(s);
    setCachedSession(s);
    setIsLoading(false);
  }, [session]);

  useEffect(() => {
    let cancelled = false;
    getSession().then((s) => {
      if (!cancelled) {
        setSession(s);
        setCachedSession(s);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return <AuthContext value={{ session, isLoading, refresh }}>{children}</AuthContext>;
}
