'use client';

import { useTranslations } from 'next-intl';
import type { ProfileHonor } from '@/lib/types';

interface AwardsSectionProps {
  honors: ProfileHonor[];
}

export function AwardsSection({ honors }: AwardsSectionProps) {
  const t = useTranslations('sections');

  if (!honors.length) return null;

  return (
    <section className="mt-8" aria-label={t('awards')}>
      <h2 className="mb-4 text-xl font-semibold">{t('awards')}</h2>
      <div className="space-y-3">
        {honors.map((honor) => (
          <div key={honor.rkey} className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium">{honor.title}</p>
              {honor.issuer && <p className="text-sm text-muted-foreground">{honor.issuer}</p>}
            </div>
            {honor.date && (
              <span className="shrink-0 text-xs text-muted-foreground">{honor.date}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
