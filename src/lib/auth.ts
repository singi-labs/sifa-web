const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

export interface AuthSession {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
}

export async function getSession(): Promise<AuthSession | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/session`, {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.did || !data.handle) return null;
    return data;
  } catch {
    return null;
  }
}

export function getLoginUrl(): string {
  return `${API_URL}/api/auth/login`;
}

export function getLogoutUrl(): string {
  return `${API_URL}/api/auth/logout`;
}
