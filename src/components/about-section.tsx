'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { sanitize } from '@/lib/sanitize';

const COLLAPSE_THRESHOLD = 300;

interface AboutSectionProps {
  about: string;
  isOwnProfile?: boolean;
}

export function AboutSection({ about, isOwnProfile }: AboutSectionProps) {
  const t = useTranslations('profile');
  const [expanded, setExpanded] = useState(false);

  if (!about && !isOwnProfile) return null;

  if (!about && isOwnProfile) {
    return (
      <section className="mt-6">
        <p className="text-sm text-muted-foreground">{t('addAbout')}</p>
      </section>
    );
  }

  const sanitized = sanitize(about);
  const isLong = sanitized.length > COLLAPSE_THRESHOLD;
  const displayText = isLong && !expanded ? sanitized.slice(0, COLLAPSE_THRESHOLD) + '...' : sanitized;

  return (
    <section className="mt-6" aria-label={t('about')}>
      <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
        {displayText}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {expanded ? t('readLess') : t('readMore')}
        </button>
      )}
    </section>
  );
}
