'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/user-menu';
import { MobileNav } from '@/components/mobile-nav';
import { SuggestionBadge } from '@/components/suggestion-badge';
import { useAuth } from '@/components/auth-provider';

export function SiteHeader() {
  const t = useTranslations('common');
  const { session } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2" aria-label={t('home')}>
            <Image
              src="/sifa-logo-light.svg"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 dark:hidden"
            />
            <Image
              src="/sifa-logo-dark.svg"
              alt=""
              width={28}
              height={28}
              className="hidden h-7 w-7 dark:block"
            />
            <span className="text-lg font-semibold">Sifa ID</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label={t('mainNav')}>
            <Link
              href="/search"
              className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {t('search')}
              <SuggestionBadge />
            </Link>
            {session && (
              <Link
                href="/my-network"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {t('myNetwork')}
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex md:items-center md:gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
