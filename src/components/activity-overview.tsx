'use client';

import { lazy, Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight } from '@phosphor-icons/react';
import { fetchActivityTeaser } from '@/lib/api';
import type { ActivityItem } from '@/lib/api';
import { ActivityIndicators } from './activity-indicators';
import { getCardComponent } from './activity-cards/card-registry';
import { GenericActivityCard } from './activity-cards/generic-activity-card';
import { CardErrorBoundary } from './activity-cards/card-error-boundary';
import type { ActiveApp } from '@/lib/types';

const ActivityHeatmap = lazy(() =>
  import('./activity-heatmap/activity-heatmap').then((m) => ({ default: m.ActivityHeatmap })),
);

interface ActivityOverviewProps {
  handle: string;
  activeApps?: ActiveApp[];
}

export function ActivityOverview({ handle, activeApps = [] }: ActivityOverviewProps) {
  const t = useTranslations('activityOverview');
  const [items, setItems] = useState<ActivityItem[] | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchActivityTeaser(handle).then((data) => {
      if (cancelled) return;
      setItems(data?.items ?? null);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [handle]);

  const validItems = (items ?? []).filter((item) => {
    if (item.record == null) return false;
    // Hide image-only Bluesky posts — they render as empty rows in compact mode
    if (
      item.collection === 'app.bsky.feed.post' &&
      !(item.record as { text?: string }).text?.trim()
    ) {
      return false;
    }
    return true;
  });
  const teaserItems = validItems.slice(0, 5);

  return (
    <section className="mt-8" aria-label={t('title')} data-testid="activity-overview">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('title')}</h2>
      </div>
      {activeApps.length > 0 && (
        <div className="mt-3">
          <ActivityIndicators apps={activeApps} maxVisible={5} />
        </div>
      )}
      <div className="mt-4">
        <Suspense fallback={<div className="h-[100px] w-full animate-pulse rounded-lg bg-muted" />}>
          <ActivityHeatmap handle={handle} days={365} variant="compact" />
        </Suspense>
      </div>
      {teaserItems.length > 0 && (
        <div className="mt-4 space-y-2">
          {teaserItems.map((item) => {
            const SpecificCard = getCardComponent(item.collection);
            const CardComponent = SpecificCard ?? GenericActivityCard;
            const did = item.uri.split('/')[2] ?? '';
            return (
              <CardErrorBoundary key={item.uri}>
                <CardComponent
                  uri={item.uri}
                  collection={item.collection}
                  rkey={item.rkey}
                  record={item.record}
                  authorDid={did}
                  authorHandle={handle}
                  showAuthor={false}
                  compact={true}
                />
              </CardErrorBoundary>
            );
          })}
        </div>
      )}
      <Link
        href={`/p/${handle}/activity`}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-muted py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
        data-testid="activity-view-all"
      >
        {t('viewAll')}
        <ArrowRight className="h-4 w-4" weight="bold" aria-hidden="true" />
      </Link>
    </section>
  );
}
