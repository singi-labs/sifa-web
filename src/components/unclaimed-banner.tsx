'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { X } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth-provider';

const SESSION_STORAGE_KEY = 'sifa-unclaimed-banner-dismissed';

function getWasDismissed() {
  return typeof window !== 'undefined' && sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
}

export function UnclaimedBanner() {
  const t = useTranslations('unclaimedBanner');
  const { session, isLoading } = useAuth();
  const wasDismissedOnLoad = useSyncExternalStore(
    () => () => {},
    getWasDismissed,
    () => true,
  );
  const [dismissed, setDismissed] = useState(false);

  if (isLoading || session || wasDismissedOnLoad || dismissed) {
    return null;
  }

  return (
    <div
      role="status"
      className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-2">
        <p>
          {t('text')}{' '}
          <Link
            href="/login"
            className="font-medium underline underline-offset-4 hover:text-amber-950 dark:hover:text-amber-100"
          >
            {t('claimYourProfile')}
          </Link>
        </p>
        <button
          type="button"
          onClick={() => {
            sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
            setDismissed(true);
          }}
          className="ml-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-amber-700 transition-colors hover:bg-amber-100 hover:text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-amber-400 dark:hover:bg-amber-900 dark:hover:text-amber-200"
          aria-label={t('dismiss')}
        >
          <X className="h-4 w-4" weight="bold" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
