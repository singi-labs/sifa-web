'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Info, X } from '@phosphor-icons/react';
import type { TrustStat } from '@/lib/types';

interface TrustStatsHintsProps {
  trustStats?: TrustStat[];
  isOwnProfile?: boolean;
  did?: string;
  createdAt?: string;
}

const HINT_KEYS = ['connections', 'endorsements', 'reactions'] as const;
type HintKey = (typeof HINT_KEYS)[number];

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function getStorageKey(did: string): string {
  return `sifa:hints-dismissed:${did}`;
}

function isPersistedDismissed(did?: string): boolean {
  if (!did) return false;
  try {
    return localStorage.getItem(getStorageKey(did)) === 'true';
  } catch {
    return false;
  }
}

function persistDismissal(did?: string): void {
  if (!did) return;
  try {
    localStorage.setItem(getStorageKey(did), 'true');
  } catch {
    // localStorage unavailable (SSR, private browsing)
  }
}

function isAccountOlderThan30Days(createdAt?: string): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  return Date.now() - created > THIRTY_DAYS_MS;
}

export function TrustStatsHints({
  trustStats = [],
  isOwnProfile,
  did,
  createdAt,
}: TrustStatsHintsProps) {
  const t = useTranslations('trustStatsHints');
  const [dismissed, setDismissed] = useState(() => isPersistedDismissed(did));

  if (!isOwnProfile || dismissed) return null;

  if (isAccountOlderThan30Days(createdAt)) return null;

  // Hide if all stats are above 0 (user has activity)
  const allAboveZero = trustStats.length > 0 && trustStats.every((s) => s.value > 0);
  if (allAboveZero) return null;

  const hintsToShow = HINT_KEYS.filter((key) => {
    const stat = trustStats.find((s) => s.key === key);
    return !stat || stat.value === 0;
  });

  if (hintsToShow.length === 0) return null;

  const handleDismiss = () => {
    setDismissed(true);
    persistDismissal(did);
  };

  return (
    <div className="mt-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Info className="h-4 w-4 text-primary" weight="fill" aria-hidden="true" />
          <span className="text-sm font-medium text-primary">{t('heading')}</span>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded p-0.5 text-muted-foreground hover:text-foreground"
          aria-label="Dismiss hints"
        >
          <X className="h-3.5 w-3.5" weight="bold" aria-hidden="true" />
        </button>
      </div>
      <ul className="space-y-1">
        {hintsToShow.map((key: HintKey) => (
          <li key={key} className="text-sm text-muted-foreground">
            {t(key)}
          </li>
        ))}
      </ul>
    </div>
  );
}
