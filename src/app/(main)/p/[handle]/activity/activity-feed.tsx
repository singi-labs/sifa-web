'use client';

import { useCallback, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { SpinnerGap } from '@phosphor-icons/react';
import { fetchActivityFeed } from '@/lib/api';
import type { ActivityFeedResponse, ActivityItem } from '@/lib/api';
import { getCardComponent } from '@/components/activity-cards/card-registry';
import { GenericActivityCard } from '@/components/activity-cards/generic-activity-card';
import { CardErrorBoundary } from '@/components/activity-cards/card-error-boundary';
import { ActivityIntro } from '@/components/activity-intro';

const CATEGORIES = [
  { key: 'all', labelKey: 'categoryAll' },
  { key: 'Posts', labelKey: 'categoryPosts' },
  { key: 'Code', labelKey: 'categoryCode' },
  { key: 'Photos', labelKey: 'categoryPhotos' },
  { key: 'Articles', labelKey: 'categoryArticles' },
  { key: 'Events', labelKey: 'categoryEvents' },
  { key: 'Links', labelKey: 'categoryLinks' },
  { key: 'Pastes', labelKey: 'categoryPastes' },
] as const;

interface ActivityFeedProps {
  handle: string;
  initialData: ActivityFeedResponse | null;
  initialCategory?: string;
}

export function ActivityFeed({ handle, initialData, initialCategory }: ActivityFeedProps) {
  const t = useTranslations('activity');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [items, setItems] = useState<ActivityItem[]>(initialData?.items ?? []);
  const [cursor, setCursor] = useState<string | null>(initialData?.cursor ?? null);
  const [hasMore, setHasMore] = useState(initialData?.hasMore ?? false);
  const [error, setError] = useState(initialData === null);
  const [isPending, startTransition] = useTransition();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Track previous initialCategory to detect external filter changes (React-recommended pattern)
  const [prevInitialCategory, setPrevInitialCategory] = useState(initialCategory);
  if (initialCategory !== prevInitialCategory) {
    setPrevInitialCategory(initialCategory);
    if (initialCategory && initialCategory !== activeCategory) {
      setActiveCategory(initialCategory);
      setError(false);
      // Trigger data fetch for the new category
      startTransition(async () => {
        const data = await fetchActivityFeed(handle, {
          category: initialCategory,
          limit: 20,
        });
        if (data) {
          setItems(data.items);
          setCursor(data.cursor);
          setHasMore(data.hasMore);
        } else {
          setItems([]);
          setCursor(null);
          setHasMore(false);
          setError(true);
        }
      });
    }
  }

  const availableCategories = initialData?.availableCategories;
  const hasMultipleCategories = availableCategories && availableCategories.length > 1;
  const showCategoryTabs = !availableCategories || hasMultipleCategories;
  const visibleCategories = hasMultipleCategories
    ? CATEGORIES.filter((c) => c.key === 'all' || availableCategories.includes(c.key))
    : CATEGORIES;

  const selectCategory = useCallback(
    (category: string) => {
      if (category === activeCategory) return;
      setActiveCategory(category);
      setError(false);

      startTransition(async () => {
        const data = await fetchActivityFeed(handle, {
          category,
          limit: 20,
        });
        if (data) {
          setItems(data.items);
          setCursor(data.cursor);
          setHasMore(data.hasMore);
        } else {
          setItems([]);
          setCursor(null);
          setHasMore(false);
          setError(true);
        }
      });
    },
    [activeCategory, handle],
  );

  const loadMore = useCallback(async () => {
    if (!cursor || isLoadingMore) return;
    setIsLoadingMore(true);

    const data = await fetchActivityFeed(handle, {
      category: activeCategory,
      limit: 20,
      cursor,
    });

    if (data) {
      setItems((prev) => [...prev, ...data.items]);
      setCursor(data.cursor);
      setHasMore(data.hasMore);
    } else {
      setError(true);
    }

    setIsLoadingMore(false);
  }, [cursor, isLoadingMore, handle, activeCategory]);

  return (
    <div>
      <ActivityIntro />

      {/* Category tabs — hidden when user has content in only one category */}
      {showCategoryTabs && (
        <div
          className="mb-6 flex gap-2 overflow-x-auto"
          role="tablist"
          aria-label={t('categoryTabsLabel')}
        >
          {visibleCategories.map(({ key, labelKey }) => {
            const isActive = activeCategory === key;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={isActive}
                aria-controls="activity-feed-panel"
                onClick={() => selectCategory(key)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                {t(labelKey)}
              </button>
            );
          })}
        </div>
      )}

      {/* Feed panel */}
      <div id="activity-feed-panel" role="tabpanel" aria-live="polite">
        {/* Loading state (category switch) */}
        {isPending && (
          <div className="flex items-center justify-center py-16">
            <SpinnerGap
              className="h-8 w-8 animate-spin text-muted-foreground"
              weight="bold"
              aria-label={t('loading')}
            />
          </div>
        )}

        {/* Error state */}
        {!isPending && error && items.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">{t('errorLoading')}</p>
          </div>
        )}

        {/* Empty state */}
        {!isPending && !error && items.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">{t('noActivity')}</p>
          </div>
        )}

        {/* Activity cards */}
        {!isPending && items.length > 0 && (
          <div className="flex flex-col gap-3">
            {items
              .filter((item) => item.record != null)
              .map((item) => {
                const CardComponent = getCardComponent(item.collection) ?? GenericActivityCard;
                return (
                  <CardErrorBoundary key={item.uri}>
                    <CardComponent
                      uri={item.uri}
                      collection={item.collection}
                      rkey={item.rkey}
                      record={item.record}
                      authorDid=""
                      authorHandle={handle}
                      showAuthor={false}
                      compact={false}
                    />
                  </CardErrorBoundary>
                );
              })}
          </div>
        )}

        {/* Load more button */}
        {!isPending && hasMore && items.length > 0 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-2 rounded-lg bg-muted px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 disabled:opacity-50"
            >
              {isLoadingMore && (
                <SpinnerGap className="h-4 w-4 animate-spin" weight="bold" aria-hidden="true" />
              )}
              {isLoadingMore ? t('loadingMore') : t('loadMore')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
