'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';

export default function ProfileRedirectPage() {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (session?.handle) {
      router.replace(`/p/${session.handle}`);
    } else {
      router.replace('/login');
    }
  }, [session, isLoading, router]);

  return null;
}
