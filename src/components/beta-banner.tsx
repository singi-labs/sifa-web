'use client';

import { useState } from 'react';
import { X } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';

export function BetaBanner() {
  const t = useTranslations('common');
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <div
      role="status"
      className="border-b border-border bg-muted px-4 py-2 text-center text-sm text-muted-foreground"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-2">
        <p>{t('betaBanner')}</p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="ml-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t('dismissBanner')}
        >
          <X className="h-4 w-4" weight="bold" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
