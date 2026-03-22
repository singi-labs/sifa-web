'use client';

import { useState } from 'react';
import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { X } from '@phosphor-icons/react';
import { ActivityHeatmap } from '@/components/activity-heatmap/activity-heatmap';
import { ActivityIndicators } from '@/components/activity-indicators';
import { ActivityFeed } from './activity-feed';
import type { ActivityFeedResponse } from '@/lib/api';
import type { ActiveApp } from '@/lib/types';

interface ActivityPageContentProps {
  handle: string;
  activeApps: ActiveApp[];
  initialData: ActivityFeedResponse | null;
}

export function ActivityPageContent({ handle, activeApps, initialData }: ActivityPageContentProps) {
  const t = useTranslations('activityIndicators');
  const [appFilter, setAppFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);

  // Find the category for the filtered app (used to filter the feed)
  const filteredApp = appFilter ? activeApps.find((a) => a.id === appFilter) : null;
  const feedCategory = filteredApp?.category ?? 'all';

  return (
    <>
      {activeApps.length > 0 && (
        <div className="mb-4">
          <ActivityIndicators
            apps={activeApps}
            maxVisible={5}
            activeFilter={appFilter}
            onFilter={(id) => {
              setAppFilter(id);
              setDateFilter(null);
            }}
          />
          {appFilter && (
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAppFilter(null)}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X size={12} weight="bold" aria-hidden="true" />
                {t('clearFilter')}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mb-6">
        <Suspense fallback={<div className="h-[136px] w-full animate-pulse rounded-lg bg-muted" />}>
          <ActivityHeatmap
            handle={handle}
            days={365}
            variant="full"
            onSelectDate={setDateFilter}
            selectedDate={dateFilter}
          />
        </Suspense>
      </div>

      <ActivityFeed handle={handle} initialData={initialData} initialCategory={feedCategory} />
    </>
  );
}
