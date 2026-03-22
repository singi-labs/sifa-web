import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr';
import { fetchProfile, fetchActivityFeed } from '@/lib/api';
import { ActivityPageContent } from './activity-page-content';
import type { ActiveApp } from '@/lib/types';

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

  const [profile, initialData] = await Promise.all([
    fetchProfile(handle),
    fetchActivityFeed(handle, {
      category: 'all',
      limit: 20,
    }),
  ]);

  const activeApps: ActiveApp[] = profile?.activeApps ?? [];

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

      <ActivityPageContent handle={handle} activeApps={activeApps} initialData={initialData} />
    </div>
  );
}
