'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { trackEvent } from '@/lib/analytics';
import { hasSeenOnboarding } from '@/lib/onboarding';

export function AuthReturnHandler() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const tracked = useRef(false);

  useEffect(() => {
    if (isLoading || !session) return;

    if (!tracked.current) {
      tracked.current = true;
      trackEvent('signup');
    }

    // Honor explicit returnTo first
    const returnTo = sessionStorage.getItem('auth_returnTo');
    if (returnTo && returnTo !== '/') {
      sessionStorage.removeItem('auth_returnTo');
      router.replace(returnTo);
      return;
    }
    sessionStorage.removeItem('auth_returnTo');

    // Redirect new users to /welcome (unless already seen this session)
    if (session.isNewUser && !hasSeenOnboarding()) {
      router.replace('/welcome');
    }
  }, [session, isLoading, router]);

  return null;
}
