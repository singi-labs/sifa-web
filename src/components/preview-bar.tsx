'use client';

import { useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X } from '@phosphor-icons/react';
import { useProfileEdit } from '@/components/profile-edit-provider';

export function PreviewBar() {
  const { previewMode, togglePreview } = useProfileEdit();
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (previewMode) {
      barRef.current?.focus();
    }
  }, [previewMode]);

  const t = useTranslations('profile');

  if (!previewMode) return null;

  return (
    <div
      ref={barRef}
      tabIndex={-1}
      role="status"
      aria-live="polite"
      className="sticky top-14 z-40 flex items-center justify-between gap-3 border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
    >
      <span className="font-medium">{t('previewBanner')}</span>
      <button
        type="button"
        onClick={togglePreview}
        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-amber-300 bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900 transition-colors hover:bg-amber-200 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-200 dark:hover:bg-amber-800"
      >
        <X className="h-3 w-3" weight="bold" aria-hidden="true" />
        {t('exitPreview')}
      </button>
    </div>
  );
}
