import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr';
import { fetchActivityFeed } from '@/lib/api';
import { ActivityHeatmap } from '@/components/activity-heatmap/activity-heatmap';
import { ActivityFeed } from './activity-feed';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  return {
    title: `Activity - ${handle}`,
    robots: { index: false, follow: false },
  };
}

export default async function ActivityPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const t = await getTranslations('activity');

  const initialData = await fetchActivityFeed(handle, {
    category: 'all',
    limit: 20,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <nav className="mb-6" aria-label={t('breadcrumb')}>
        <Link
          href={`/p/${handle}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" weight="bold" aria-hidden="true" />
          {t('backToProfile')}
        </Link>
      </nav>

      <h1 className="mb-6 text-2xl font-bold">{t('title', { handle })}</h1>

      <div className="mb-6">
        <Suspense fallback={<div className="h-[136px] w-full animate-pulse rounded-lg bg-muted" />}>
          <ActivityHeatmap handle={handle} days={365} variant="full" />
        </Suspense>
      </div>

      <ActivityFeed handle={handle} initialData={initialData} />
    </div>
  );
}
