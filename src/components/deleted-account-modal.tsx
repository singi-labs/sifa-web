'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function DeletedAccountModal() {
  const [visible, setVisible] = useState(true);
  const t = useTranslations('dangerZone');

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
        <h2 className="mb-2 text-lg font-semibold">{t('deleteModalTitle')}</h2>
        <p className="mb-4 text-sm text-muted-foreground">{t('deleteModalBody')}</p>
        <a
          href="https://bsky.app/settings"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 block text-sm text-primary underline"
        >
          {t('deleteModalBlueskyLink')}
        </a>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t('deleteModalDismiss')}
        </button>
      </div>
    </div>
  );
}
