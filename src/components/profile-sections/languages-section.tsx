'use client';

import { useTranslations } from 'next-intl';
import type { ProfileLanguage } from '@/lib/types';

const PROFICIENCY_LABELS: Record<string, string> = {
  elementary: 'Elementary',
  limited_working: 'Limited working',
  professional_working: 'Professional working',
  full_professional: 'Full professional',
  native: 'Native or bilingual',
};

interface LanguagesSectionProps {
  languages: ProfileLanguage[];
}

export function LanguagesSection({ languages }: LanguagesSectionProps) {
  const t = useTranslations('sections');

  if (!languages.length) return null;

  return (
    <section className="mt-8" aria-label={t('languages')}>
      <h2 className="mb-4 text-xl font-semibold">{t('languages')}</h2>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {languages.map((lang) => (
          <div key={lang.rkey} className="flex items-baseline gap-1.5">
            <span className="font-medium">{lang.language}</span>
            {lang.proficiency && (
              <span className="text-xs text-muted-foreground">
                ({PROFICIENCY_LABELS[lang.proficiency] ?? lang.proficiency})
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
