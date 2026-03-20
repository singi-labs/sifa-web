'use client';

import { useTranslations } from 'next-intl';
import { ArrowSquareOut } from '@phosphor-icons/react';
import { useProfileEdit } from '@/components/profile-edit-provider';

interface DataTransparencyCardProps {
  did: string;
}

export function DataTransparencyCard({ did }: DataTransparencyCardProps) {
  const t = useTranslations('dataTransparency');
  const { previewMode } = useProfileEdit();

  if (previewMode) return null;

  const viewerUrl = `https://atproto.at/viewer?uri=${did}`;

  return (
    <section
      className="mt-4 rounded-xl border border-border bg-card p-4"
      aria-labelledby="data-transparency-title"
    >
      <h2 id="data-transparency-title" className="text-sm font-semibold">
        {t('title')}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{t('body')}</p>
      <a
        href={viewerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        {t('viewRawData')}
        <ArrowSquareOut className="h-4 w-4" weight="bold" aria-hidden="true" />
      </a>
    </section>
  );
}
