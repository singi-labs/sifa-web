'use client';

import { useTranslations } from 'next-intl';

interface HeatmapSummaryStatsProps {
  totalActions: number;
  months: number;
  mostActiveApp: string | null;
  appCount: number;
}

export function HeatmapSummaryStats({
  totalActions,
  months,
  mostActiveApp,
  appCount,
}: HeatmapSummaryStatsProps) {
  const t = useTranslations('heatmap');

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      <span className="font-bold">
        {t('actionsInPeriod', { count: String(totalActions), months: String(months) })}
      </span>
      {mostActiveApp !== null && (
        <span className="text-muted-foreground">
          {t('mostActive', { app: mostActiveApp })}
        </span>
      )}
      <span className="text-muted-foreground">
        {t('appsActive', { count: String(appCount) })}
      </span>
    </div>
  );
}
