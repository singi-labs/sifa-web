'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight } from '@phosphor-icons/react';

interface ActivityOverviewProps {
  handle: string;
}

export function ActivityOverview({ handle }: ActivityOverviewProps) {
  const t = useTranslations('activityOverview');

  return (
    <section className="mt-8" aria-label={t('title')}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <Link
          href={`/p/${handle}/activity`}
          className="flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {t('viewAll')}
          <ArrowRight className="h-4 w-4" weight="bold" aria-hidden="true" />
        </Link>
      </div>
      <div className="mt-4 rounded-lg border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">{t('comingSoon')}</p>
      </div>
    </section>
  );
}
