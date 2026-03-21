'use client';

import { useTranslations } from 'next-intl';
import { getAppMeta } from '@/lib/atproto-apps';

interface HeatmapTooltipProps {
  date: string;
  total: number;
  apps: { appId: string; count: number }[];
}

function formatFullDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year!, month! - 1, day!);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function HeatmapTooltip({ date, total, apps }: HeatmapTooltipProps) {
  const t = useTranslations('heatmap');
  const formattedDate = formatFullDate(date);

  return (
    <div className="bg-popover text-popover-foreground shadow-md rounded-md text-xs px-3 py-2">
      <p className="font-medium">{formattedDate}</p>
      {total === 0 ? (
        <p className="text-muted-foreground">{t('noActivity')}</p>
      ) : (
        <>
          <ul className="mt-1 space-y-0.5">
            {apps.map(({ appId, count }) => (
              <li key={appId} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: `var(--app-${appId}-stripe)` }}
                  />
                  <span>{getAppMeta(appId).name}</span>
                </span>
                <span>{count}</span>
              </li>
            ))}
          </ul>
          <p className="mt-1 border-t pt-1 text-muted-foreground">
            {t('totalActions', { count: String(total) })}
          </p>
        </>
      )}
    </div>
  );
}
