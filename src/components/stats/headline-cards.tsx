'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface StatCardProps {
  label: string;
  value: string;
  tooltip: string;
}

function StatCard({ label, value, tooltip }: StatCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative flex flex-col items-center rounded-lg border border-border bg-secondary/50 px-6 py-4">
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-muted-foreground">{label}</span>
        <button
          type="button"
          className="text-muted-foreground/60 hover:text-muted-foreground"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowTooltip((v) => !v)}
          aria-label={`Info: ${label}`}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm-.75 3.5a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0ZM8 6.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V7a.5.5 0 0 1 .5-.5Z" />
          </svg>
        </button>
      </div>
      <span className="mt-1 text-2xl font-bold tabular-nums text-foreground">{value}</span>
      {showTooltip && (
        <div className="absolute top-full z-10 mt-2 w-64 rounded-md border border-border bg-secondary px-3 py-2 text-xs text-muted-foreground shadow-lg">
          {tooltip}
        </div>
      )}
    </div>
  );
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString('en-US');
}

interface HeadlineCardsProps {
  totalDids: number;
  reachableDids: number;
  totalPdsHosts: number;
  dataThrough: string;
}

export function HeadlineCards({
  totalDids,
  reachableDids,
  totalPdsHosts,
  dataThrough,
}: HeadlineCardsProps) {
  const t = useTranslations('stats');

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        label={t('totalDids')}
        value={formatCompact(totalDids)}
        tooltip={t('totalDidsTooltip')}
      />
      <StatCard
        label={t('reachableDids')}
        value={formatCompact(reachableDids)}
        tooltip={t('reachableDidsTooltip')}
      />
      <StatCard
        label={t('pdsHosts')}
        value={formatCompact(totalPdsHosts)}
        tooltip={t('pdsHostsTooltip')}
      />
      <StatCard label={t('lastUpdated')} value={dataThrough} tooltip={t('lastUpdatedTooltip')} />
    </div>
  );
}
