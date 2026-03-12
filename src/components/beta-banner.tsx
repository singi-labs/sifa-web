'use client';

import { useState, useSyncExternalStore } from 'react';
import { X } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';

const STORAGE_KEY = 'sifa-beta-banner-dismissed';

function getWasDismissed() {
  return typeof window !== 'undefined' && sessionStorage.getItem(STORAGE_KEY) === 'true';
}

export function BetaBanner() {
  const t = useTranslations('common');
  const wasDismissedOnLoad = useSyncExternalStore(
    () => () => {},
    getWasDismissed,
    () => true,
  );
  const [dismissed, setDismissed] = useState(false);

  if (wasDismissedOnLoad || dismissed) {
    return null;
  }

  return (
    <div
      role="status"
      className="border-b border-border bg-muted px-4 py-2 text-center text-sm text-muted-foreground"
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-center gap-2">
          <p>{t('betaBanner')}</p>
          <button
            type="button"
            onClick={() => {
              sessionStorage.setItem(STORAGE_KEY, 'true');
              setDismissed(true);
            }}
            className="ml-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={t('dismissBanner')}
          >
            <X className="h-4 w-4" weight="bold" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-1">
          {t('betaBannerSub')}{' '}
          <a
            href="https://github.com/singi-labs/sifa-workspace/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('betaBannerReportLink')}
          </a>
        </p>
      </div>
    </div>
  );
}
