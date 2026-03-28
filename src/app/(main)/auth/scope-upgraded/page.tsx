'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';

/**
 * Landing page after OAuth re-authorization (scope upgrade).
 * Reads the returnTo path from sessionStorage and redirects.
 * The backend redirects here after a successful /oauth/reauth callback.
 */
export default function ScopeUpgradedPage() {
  const router = useRouter();
  const { refresh } = useAuth();

  useEffect(() => {
    // Refresh the session to pick up new scope
    void refresh().then(() => {
      const returnTo = sessionStorage.getItem('auth_returnTo');
      sessionStorage.removeItem('auth_returnTo');
      router.replace(returnTo ?? '/meet');
    });
  }, [refresh, router]);

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center">
      <p className="text-sm text-muted-foreground">Redirecting...</p>
    </div>
  );
}
