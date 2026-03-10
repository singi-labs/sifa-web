'use client';

import { useTranslations } from 'next-intl';
import type { ProfilePublication } from '@/lib/types';

interface PublicationsSectionProps {
  publications: ProfilePublication[];
}

export function PublicationsSection({ publications }: PublicationsSectionProps) {
  const t = useTranslations('sections');

  if (!publications.length) return null;

  return (
    <section className="mt-8" aria-label={t('publications')}>
      <h2 className="mb-4 text-xl font-semibold">{t('publications')}</h2>
      <div className="space-y-3">
        {publications.map((pub) => (
          <div key={pub.rkey} className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium">
                {pub.url ? (
                  <a
                    href={pub.url}
                    className="underline-offset-4 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {pub.title}
                  </a>
                ) : (
                  pub.title
                )}
              </p>
              {pub.publisher && <p className="text-sm text-muted-foreground">{pub.publisher}</p>}
            </div>
            {pub.date && <span className="shrink-0 text-xs text-muted-foreground">{pub.date}</span>}
          </div>
        ))}
      </div>
    </section>
  );
}
