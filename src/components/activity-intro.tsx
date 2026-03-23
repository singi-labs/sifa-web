'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { X } from '@phosphor-icons/react';

const STORAGE_KEY = 'sifa-activity-intro-dismissed';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

function getServerSnapshot(): boolean {
  return true; // default dismissed on server to avoid flash
}

export function ActivityIntro() {
  const t = useTranslations('activity');
  const dismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    // Dispatch storage event so useSyncExternalStore re-reads
    window.dispatchEvent(new Event('storage'));
  }, []);

  if (dismissed) return null;

  return (
    <p className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
      <span>{t('introVisitor')}</span>
      <button
        type="button"
        onClick={handleDismiss}
        className="ml-2 shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label={t('introDismiss')}
      >
        <X size={14} aria-hidden="true" />
      </button>
    </p>
  );
}
