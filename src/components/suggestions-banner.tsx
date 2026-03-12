'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from '@phosphor-icons/react';
import { useAuth } from '@/components/auth-provider';
import { fetchSuggestionCount } from '@/lib/api';

const BANNER_DISMISSED_KEY = 'sifa:suggestions-banner-dismissed';

export function SuggestionsBanner() {
  const { session } = useAuth();
  const [count, setCount] = useState(0);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return window.localStorage.getItem(BANNER_DISMISSED_KEY) === 'true';
    } catch {
      return true; // Hidden by default on server or if localStorage unavailable
    }
  });

  useEffect(() => {
    if (!session || dismissed) return;
    void fetchSuggestionCount().then(setCount);
  }, [session, dismissed]);

  if (dismissed || count === 0) return null;

  const handleDismiss = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
    }
    setDismissed(true);
  };

  return (
    <div className="mb-6 flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-3">
      <p className="text-sm">
        <span className="font-medium">{count} people</span> you follow on Bluesky or Tangled are on
        Sifa
      </p>
      <div className="flex items-center gap-2">
        <Link href="/find-people" className="text-sm font-medium text-primary hover:underline">
          Find people
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Dismiss banner"
        >
          <X className="size-4" weight="bold" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
