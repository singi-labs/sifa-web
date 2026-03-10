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
  return '/login';
}

export function getOAuthLoginUrl(): string {
  return `${API_URL}/oauth/login`;
}

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/oauth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}
