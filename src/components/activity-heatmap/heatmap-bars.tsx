'use client';

import type { HeatmapDayData } from './heatmap-colors';

interface HeatmapBarsProps {
  days: HeatmapDayData[];
}

interface MonthBucket {
  key: string;
  label: string;
  total: number;
  apps: Map<string, number>;
}

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function aggregateMonths(days: HeatmapDayData[]): MonthBucket[] {
  const bucketMap = new Map<string, MonthBucket>();

  for (const day of days) {
    const [yearStr, monthStr] = day.date.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    const key = `${year}-${String(month).padStart(2, '0')}`;

    let bucket = bucketMap.get(key);
    if (!bucket) {
      bucket = {
        key,
        label: SHORT_MONTHS[month - 1]!,
        total: 0,
        apps: new Map(),
      };
      bucketMap.set(key, bucket);
    }

    bucket.total += day.total;
    for (const { appId, count } of day.apps) {
      bucket.apps.set(appId, (bucket.apps.get(appId) ?? 0) + count);
    }
  }

  // Sort newest first
  return [...bucketMap.values()].sort((a, b) => b.key.localeCompare(a.key));
}

export function HeatmapBars({ days }: HeatmapBarsProps) {
  if (days.length === 0) return null;

  const months = aggregateMonths(days);
  const maxTotal = Math.max(...months.map((m) => m.total), 1);

  return (
    <div className="flex flex-col gap-1">
      {months.map((month) => {
        // Sort apps largest-first for stacking
        const sortedApps = [...month.apps.entries()].sort((a, b) => b[1] - a[1]);

        return (
          <div key={month.key} className="flex items-center gap-2">
            <span className="w-8 shrink-0 text-xs text-muted-foreground" data-testid="bar-label">
              {month.label}
            </span>
            <div
              className="flex h-7 flex-1 overflow-hidden rounded-sm"
              style={{ maxWidth: `${(month.total / maxTotal) * 100}%` }}
            >
              {sortedApps.map(([appId, count]) => (
                <div
                  key={appId}
                  className="h-full"
                  style={{
                    backgroundColor: `var(--app-${appId}-stripe)`,
                    width: month.total > 0 ? `${(count / month.total) * 100}%` : '0%',
                  }}
                />
              ))}
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{month.total}</span>
          </div>
        );
      })}
    </div>
  );
}
