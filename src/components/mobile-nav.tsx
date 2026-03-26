'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowSquareIn, List, SignOut, User, Users, X } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/components/auth-provider';
import { getLoginUrl, logout } from '@/lib/auth';

export function MobileNav() {
  const t = useTranslations('common');
  const { session, isLoading, refresh } = useAuth();
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    await refresh();
  };

  return (
    <div ref={navRef}>
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

            <div className="my-1 border-t border-border" />

            {isLoading ? (
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </div>
            ) : session ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                    {session.avatar ? (
                      <Image
                        src={session.avatar}
                        alt=""
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <User
                        className="h-4 w-4 text-muted-foreground"
                        weight="bold"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {session.displayName ?? session.handle}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">@{session.handle}</p>
                  </div>
                </div>
                <Link
                  href={`/p/${session.handle}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <User className="h-4 w-4" weight="bold" aria-hidden="true" />
                  {t('viewProfile')}
                </Link>
                <Link
                  href="/my-network"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <Users className="h-4 w-4" weight="bold" aria-hidden="true" />
                  {t('myNetwork')}
                </Link>
                <Link
                  href="/import"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <ArrowSquareIn className="h-4 w-4" weight="bold" aria-hidden="true" />
                  {t('import')}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-accent"
                >
                  <SignOut className="h-4 w-4" weight="bold" aria-hidden="true" />
                  {t('signOut')}
                </button>
              </>
            ) : (
              <Link
                href={getLoginUrl()}
                onClick={() => setOpen(false)}
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {t('signIn')}
              </Link>
            )}

            <div className="flex items-center px-3 py-2">
              <ThemeToggle />
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
