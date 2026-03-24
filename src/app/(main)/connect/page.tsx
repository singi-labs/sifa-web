'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';

export default function ConnectIndexPage() {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (session?.handle) {
      router.replace(`/connect/${encodeURIComponent(session.handle)}`);
    } else {
      router.replace('/login?returnTo=/connect');
    }
  }, [session, isLoading, router]);

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-muted-foreground" />
    </div>
  );
}
