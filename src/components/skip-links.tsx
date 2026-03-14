'use client';

import { useTranslations } from 'next-intl';

export function SkipLinks() {
  const t = useTranslations('common');

  return (
    <a
      href="#main-content"
      className="absolute left-4 top-4 z-50 -translate-y-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      {t('skipToContent')}
    </a>
  );
}
