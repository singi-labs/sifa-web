'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { GithubLogo } from '@phosphor-icons/react';

export function SiteFooter() {
  const t = useTranslations('common');

  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">
            {t('builtBy')}{' '}
            <a
              href="https://singi.dev"
              className="font-medium text-foreground underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Singi Labs
            </a>
          </p>
          <p className="text-xs text-muted-foreground">{t('poweredByAtproto')}</p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label={t('footerNav')}>
          <Link
            href="/about"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {t('about')}
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {t('privacy')}
          </Link>
          <Link
            href="/terms"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {t('terms')}
          </Link>
          <a
            href="https://github.com/singi-labs"
            className="text-muted-foreground hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <GithubLogo size={20} />
          </a>
        </nav>
      </div>
    </footer>
  );
}
