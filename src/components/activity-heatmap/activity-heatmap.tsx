'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { fetchHeatmapData } from '@/lib/api';
import type { HeatmapResponse } from '@/lib/api';
import { transformHeatmapData } from './heatmap-colors';
import type { HeatmapDayData } from './heatmap-colors';
import { HeatmapGrid } from './heatmap-grid';
import { HeatmapBars } from './heatmap-bars';
import { HeatmapLegend } from './heatmap-legend';
import { HeatmapSummaryStats } from './heatmap-summary-stats';
import { getAppMeta } from '@/lib/atproto-apps';

interface ActivityHeatmapProps {
  handle: string;
  days: number;
  variant: 'compact' | 'full';
  onSelectDate?: (date: string | null) => void;
  selectedDate?: string | null;
}

function computeMonthCount(days: HeatmapDayData[]): number {
  const months = new Set<string>();
  for (const d of days) {
    months.add(d.date.slice(0, 7));
  }
  return months.size;
}

function computeMostActiveApp(
  appTotals: { appId: string; appName: string; total: number }[],
): string | null {
  if (appTotals.length === 0) return null;
  const sorted = [...appTotals].sort((a, b) => b.total - a.total);
  return sorted[0]!.appName;
}

export function ActivityHeatmap({
  handle,
  days: dayCount,
  variant,
  onSelectDate,
  selectedDate,
}: ActivityHeatmapProps) {
  const t = useTranslations('heatmap');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<HeatmapResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchHeatmapData(handle, dayCount).then((result) => {
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [handle, dayCount]);

  const handleSelectDate = useCallback(
    (date: string) => {
      if (!onSelectDate) return;
      // Toggle: if same date clicked again, clear it
      onSelectDate(selectedDate === date ? null : date);
    },
    [onSelectDate, selectedDate],
  );

  if (loading) {
    return (
      <div
        className="h-[136px] w-full animate-pulse rounded-lg bg-muted"
        role="img"
        aria-label="Loading activity heatmap"
      />
    );
  }

  const isEmpty = !data || data.days.length === 0;

  if (isEmpty) {
    return (
      <div className="flex h-[136px] w-full items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">{t('emptyState')}</p>
      </div>
    );
  }

  const transformed = transformHeatmapData(data.days, data.thresholds);
  const totalActions = data.days.reduce((sum, d) => sum + d.total, 0);
  const monthCount = computeMonthCount(transformed);
  const mostActiveApp = computeMostActiveApp(data.appTotals);
  const appTotals = data.appTotals.map((a) => ({
    appId: a.appId,
    appName: getAppMeta(a.appId).name,
    total: a.total,
  }));

  return (
    <div>
      {/* Desktop layout */}
      <div className="hidden md:flex md:items-start md:gap-6">
        <div className="flex-1">
          <HeatmapGrid
            days={transformed}
            onSelectDate={variant === 'full' ? handleSelectDate : undefined}
            selectedDate={selectedDate ?? null}
          />
        </div>
        <div className="shrink-0">
          <HeatmapLegend appTotals={appTotals} showAppKey={variant === 'full'} />
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden">
        <HeatmapBars days={transformed} />
        <div className="mt-3">
          <HeatmapLegend appTotals={appTotals} showAppKey={variant === 'full'} />
        </div>
      </div>

      {/* Summary stats (full variant only) */}
      {variant === 'full' && totalActions > 0 && (
        <div className="mt-4">
          <HeatmapSummaryStats
            totalActions={totalActions}
            months={monthCount}
            mostActiveApp={mostActiveApp}
            appCount={appTotals.length}
          />
        </div>
      )}
    </div>
  );
}
