'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function NotFound() {
  const t = useTranslations('notFound');
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);
  const easterEggRevealed = clickCount >= 4;

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <button
        type="button"
        onClick={() => setClickCount((c) => c + 1)}
        className="cursor-default select-none text-8xl font-bold tracking-tight text-foreground transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        style={easterEggRevealed ? { transform: 'rotate(360deg)' } : undefined}
        aria-label={easterEggRevealed ? t('easterEggMessage') : '404'}
      >
        404
      </button>

      <h1 className="mt-6 text-2xl font-semibold">{t('title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('description')}</p>

      {easterEggRevealed && (
        <p
          className="mt-4 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground"
          role="status"
        >
          {t('easterEggMessage')}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className={cn(buttonVariants({ size: 'lg' }))}>
          {t('goHome')}
        </Link>
        <Button variant="outline" size="lg" onClick={() => router.back()}>
          {t('goBack')}
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
        <Link
          href="/search"
          className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          {t('searchProfiles')}
        </Link>
        <span className="text-border" aria-hidden="true">
          |
        </span>
        <a
          href="https://github.com/singi-labs/sifa-web/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          {t('reportIssue')}
        </a>
      </div>
    </div>
  );
}
