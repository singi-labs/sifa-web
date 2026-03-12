'use client';

import { useState } from 'react';
import { List, X } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';

export function MobileNav() {
  const t = useTranslations('common');
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors md:hidden',
          'hover:bg-accent hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        )}
        aria-label={open ? t('closeMenu') : t('openMenu')}
        aria-expanded={open}
        aria-controls="mobile-nav"
      >
        {open ? (
          <X className="h-5 w-5" weight="bold" aria-hidden="true" />
        ) : (
          <List className="h-5 w-5" weight="bold" aria-hidden="true" />
        )}
      </button>

      {open && (
        <nav
          id="mobile-nav"
          className="absolute top-full right-0 left-0 z-40 border-b border-border bg-background md:hidden"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-3">
            <Link
              href="/search"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              {t('search')}
            </Link>
            <Link
              href="/import"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              {t('import')}
            </Link>
            <Link
              href="/find-people"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              {t('findPeople')}
            </Link>
            <div className="flex items-center gap-2 px-3 py-2">
              <ThemeToggle />
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {t('signIn')}
              </Link>
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
