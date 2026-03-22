'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Info, X, GithubLogo } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';

const STORAGE_KEY = 'sifa-beta-banner-dismissed';

function getWasDismissed() {
  return typeof window !== 'undefined' && sessionStorage.getItem(STORAGE_KEY) === 'true';
}

export function BetaBanner() {
  const t = useTranslations('common');
  const wasDismissedOnLoad = useSyncExternalStore(
    () => () => {},
    getWasDismissed,
    () => true,
  );
  const [dismissed, setDismissed] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!popoverOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setPopoverOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setPopoverOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [popoverOpen]);

  if (wasDismissedOnLoad || dismissed) {
    return null;
  }

  return (
    <div
      role="status"
      className="relative border-b border-warning-border bg-warning-bg px-4 py-1.5 text-center text-sm font-medium text-warning-text"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-1.5">
        <p>{t('betaBanner')}</p>
        <div className="relative">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setPopoverOpen((prev) => !prev)}
            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-warning-text transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={t('betaBannerInfoLabel')}
            aria-expanded={popoverOpen}
            aria-haspopup="dialog"
          >
            <Info className="h-4 w-4" weight="bold" aria-hidden="true" />
          </button>
          {popoverOpen && (
            <div
              ref={popoverRef}
              role="dialog"
              aria-label={t('betaBannerInfoLabel')}
              className="absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 rounded-lg border border-border bg-card p-4 text-left text-sm text-card-foreground shadow-lg"
            >
              <p className="mb-3">{t('betaBannerDetail')}</p>
              <a
                href="https://github.com/singi-labs/sifa-workspace/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <GithubLogo className="h-4 w-4" weight="bold" aria-hidden="true" />
                {t('betaBannerReportLink')}
              </a>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            sessionStorage.setItem(STORAGE_KEY, 'true');
            setDismissed(true);
          }}
          className="ml-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-warning-text transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t('dismissBanner')}
        >
          <X className="h-3.5 w-3.5" weight="bold" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
