'use client';

import { useTranslations } from 'next-intl';

interface AppTotal {
  appId: string;
  appName: string;
  total: number;
}

interface HeatmapLegendProps {
  appTotals: AppTotal[];
  showAppKey: boolean;
}

const INTENSITY_LEVELS = [0, 0.3, 0.55, 0.8, 1.0] as const;
const MAX_APP_KEY_ITEMS = 6;

export function HeatmapLegend({ appTotals, showAppKey }: HeatmapLegendProps) {
  const t = useTranslations('heatmap');

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {/* Intensity scale */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-[var(--heatmap-label)]">{t('less')}</span>
        {INTENSITY_LEVELS.map((opacity, i) => (
          <span
            key={i}
            className="inline-block h-3 w-3 rounded-sm"
            style={
              opacity === 0
                ? { backgroundColor: 'var(--heatmap-empty)' }
                : {
                    backgroundColor: 'var(--app-bluesky-stripe)',
                    opacity,
                  }
            }
          />
        ))}
        <span className="text-xs text-[var(--heatmap-label)]">{t('more')}</span>
      </div>

      {/* App color key */}
      {showAppKey && appTotals.length > 0 && (
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
      )}
    </div>
  );
}
