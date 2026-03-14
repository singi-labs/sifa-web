'use client';

import { useTranslations } from 'next-intl';

export function SkipLinks() {
  const t = useTranslations('common');

  return (
    <a
      href="#main-content"
      className="absolute left-4 top-0 z-[60] -translate-y-full opacity-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-[transform,opacity] focus:top-4 focus:translate-y-0 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      {t('skipToContent')}
    </a>
  );
}
