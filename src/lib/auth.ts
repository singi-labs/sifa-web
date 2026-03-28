const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

export interface AuthSession {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
  isNewUser?: boolean;
  hasMeetScope?: boolean;
}

export type SessionResult =
  | { status: 'authenticated'; session: AuthSession }
  | { status: 'unauthenticated' }
  | { status: 'unavailable' }; // transient error — keep showing cached session

export async function getSession(): Promise<SessionResult> {
  try {
    const res = await fetch(`${API_URL}/api/auth/session`, {
      credentials: 'include',
      cache: 'no-store',
    });
    if (res.status === 503) {
      return { status: 'unavailable' };
    }
    if (!res.ok) {
      return { status: 'unauthenticated' };
    }
    const data = await res.json();
    if (!data.authenticated || !data.did || !data.handle) {
      return { status: 'unauthenticated' };
    }
    return { status: 'authenticated', session: data };
  } catch {
    // Network error (API completely down) — treat as transient
    return { status: 'unavailable' };
  }
}

export function getLoginUrl(): string {
  return '/login';
}

export function getOAuthLoginUrl(): string {
  return `${API_URL}/oauth/login`;
}

export function getOAuthSignupUrl(): string {
  return `${API_URL}/oauth/signup`;
}

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/oauth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

/**
 * Request re-authorization with expanded scopes (e.g. for /meet).
 * Stores returnTo in sessionStorage so the user lands back on the
 * right page after the OAuth redirect.
 */
export async function requestReauth(returnTo: string): Promise<string | null> {
  sessionStorage.setItem('auth_returnTo', returnTo);
  try {
    const res = await fetch(`${API_URL}/oauth/reauth`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { redirectUrl: string };
    return data.redirectUrl;
  } catch {
    return null;
  }
}
