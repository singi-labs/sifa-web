'use client';

interface AppTotal {
  appId: string;
  appName: string;
  total: number;
}

interface HeatmapLegendProps {
  appTotals: AppTotal[];
  showAppKey: boolean;
}

const MAX_APP_KEY_ITEMS = 6;

export function HeatmapLegend({ appTotals, showAppKey }: HeatmapLegendProps) {
  if (!showAppKey || appTotals.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {appTotals.slice(0, MAX_APP_KEY_ITEMS).map(({ appId, appName }) => (
        <span key={appId} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: `var(--app-${appId}-stripe)` }}
          />
          <span className="text-xs text-muted-foreground">{appName}</span>
        </span>
      ))}
    </div>
  );
}
