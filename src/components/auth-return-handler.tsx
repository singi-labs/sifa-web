'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';

export function AuthReturnHandler() {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !session) return;

    const returnTo = sessionStorage.getItem('auth_returnTo');
    if (returnTo && returnTo !== '/') {
      sessionStorage.removeItem('auth_returnTo');
      router.replace(returnTo);
    }
  }, [session, isLoading, router]);

  return null;
}
