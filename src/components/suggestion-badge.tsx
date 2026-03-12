'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { fetchSuggestionCount } from '@/lib/api';

export function SuggestionBadge() {
  const { session } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!session) return;

    const since =
      typeof window !== 'undefined' && window.localStorage
        ? window.localStorage.getItem('sifa:suggestions-last-visited')
        : null;
    void fetchSuggestionCount(since ?? undefined).then(setCount);
  }, [session]);

  if (count === 0) return null;

  return (
    <span className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
      {count > 99 ? '99+' : count}
    </span>
  );
}
