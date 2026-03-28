'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { fetchHeatmapData } from '@/lib/api';
import type { HeatmapResponse } from '@/lib/api';
import { transformHeatmapData, filterHeatmapData } from './heatmap-colors';
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

  const [loadingSlow, setLoadingSlow] = useState(false);
  const [hiddenApps, setHiddenApps] = useState<Set<string>>(new Set());

  const toggleApp = useCallback((appId: string) => {
    setHiddenApps((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) {
        next.delete(appId);
      } else {
        next.add(appId);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoadingSlow(true), 3000);
    return () => clearTimeout(timer);
  }, [loading]);

  const computed = useMemo(() => {
    if (!data || data.days.length === 0) return null;
    const transformed = transformHeatmapData(data.days, data.thresholds);
    const appTotals = data.appTotals.map((a) => ({
      appId: a.appId,
      appName: getAppMeta(a.appId).name,
      total: a.total,
    }));
    const filteredDays = filterHeatmapData(transformed, hiddenApps, data.thresholds);
    const visibleAppTotals = appTotals.filter((a) => !hiddenApps.has(a.appId));
    return { filteredDays, appTotals, visibleAppTotals };
  }, [data, hiddenApps]);

  if (loading) {
    return (
      <div
        className="flex h-[136px] w-full items-center justify-center rounded-lg bg-muted"
        role="status"
        aria-label={loadingSlow ? t('loadingSlow') : t('loading')}
      >
        <p className="text-sm text-muted-foreground">
          {loadingSlow ? t('loadingSlow') : t('loading')}
        </p>
      </div>
    );
  }

  if (!computed) {
    return (
      <div className="flex h-[136px] w-full items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">{t('emptyState')}</p>
      </div>
    );
  }

  const { filteredDays, appTotals, visibleAppTotals } = computed;
  const totalActions = filteredDays.reduce((sum, d) => sum + d.total, 0);
  const monthCount = Math.round(dayCount / 30);
  const mostActiveApp = computeMostActiveApp(visibleAppTotals);

  return (
    <div>
      {/* Summary stats (full variant only) */}
      {variant === 'full' && totalActions > 0 && (
        <div className="mb-4">
          <HeatmapSummaryStats
            totalActions={totalActions}
            months={monthCount}
            mostActiveApp={mostActiveApp}
            appCount={visibleAppTotals.length}
          />
        </div>
      )}

      {/* Desktop: calendar grid */}
      <div className="hidden md:block">
        <HeatmapGrid
          days={filteredDays}
          daysBack={dayCount}
          onSelectDate={variant === 'full' ? handleSelectDate : undefined}
          selectedDate={selectedDate ?? null}
        />
        <div className="mt-3">
          <HeatmapLegend
            appTotals={appTotals}
            showAppKey={variant === 'full'}
            hiddenApps={hiddenApps}
            onToggleApp={toggleApp}
          />
        </div>
      </div>

      {/* Mobile: stacked bars */}
      <div className="md:hidden">
        <HeatmapBars days={filteredDays} />
        <div className="mt-3">
          <HeatmapLegend
            appTotals={appTotals}
            showAppKey={variant === 'full'}
            hiddenApps={hiddenApps}
            onToggleApp={toggleApp}
          />
        </div>
      </div>
    </div>
  );
}
