'use client';

import { useState } from 'react';
import { Info, X } from '@phosphor-icons/react';
import type { TrustStat } from '@/lib/types';

interface TrustStatsHintsProps {
  trustStats?: TrustStat[];
  isOwnProfile?: boolean;
}

const STAT_HINTS: Record<string, string> = {
  connections: 'Follow other professionals on Sifa to grow your network.',
  endorsements: 'Ask colleagues to endorse your skills on your profile.',
  reactions: 'Share professional insights to earn reactions from others.',
};

export function TrustStatsHints({ trustStats = [], isOwnProfile }: TrustStatsHintsProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!isOwnProfile || dismissed) return null;

  // Hide if all stats are above 0 (user has activity)
  const allAboveZero = trustStats.length > 0 && trustStats.every((s) => s.value > 0);
  if (allAboveZero) return null;

  const hintsToShow = Object.entries(STAT_HINTS).filter(([key]) => {
    const stat = trustStats.find((s) => s.key === key);
    return !stat || stat.value === 0;
  });

  if (hintsToShow.length === 0) return null;

  return (
    <div className="mt-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Info className="h-4 w-4 text-primary" weight="fill" aria-hidden="true" />
          <span className="text-sm font-medium text-primary">Grow your track record</span>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded p-0.5 text-muted-foreground hover:text-foreground"
          aria-label="Dismiss hints"
        >
          <X className="h-3.5 w-3.5" weight="bold" aria-hidden="true" />
        </button>
      </div>
      <ul className="space-y-1">
        {hintsToShow.map(([key, hint]) => (
          <li key={key} className="text-sm text-muted-foreground">
            {hint}
          </li>
        ))}
      </ul>
    </div>
  );
}
