'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { PencilSimple, SignOut, User } from '@phosphor-icons/react';
import { useAuth } from '@/components/auth-provider';
import { getLoginUrl, logout } from '@/lib/auth';
import { useState, useRef, useEffect } from 'react';

export function UserMenu() {
  const { session, isLoading, refresh } = useAuth();
  const t = useTranslations('common');
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    await refresh();
  };
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (isLoading) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />;
  }

  if (!session) {
    return (
      <a
        href={getLoginUrl()}
        className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-foreground"
      >
        {t('signIn')}
      </a>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="User menu"
      >
        {session.avatar ? (
          <Image
            src={session.avatar}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <User className="h-4 w-4 text-muted-foreground" weight="bold" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-10 z-50 w-48 rounded-md border border-border bg-card py-1 shadow-lg"
          role="menu"
        >
          <div className="border-b border-border px-3 py-2">
            <p className="truncate text-sm font-medium">{session.displayName ?? session.handle}</p>
            <p className="truncate text-xs text-muted-foreground">@{session.handle}</p>
          </div>
          <Link
            href={`/p/${session.handle}`}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <User className="h-4 w-4" weight="bold" aria-hidden="true" />
            View profile
          </Link>
          <Link
            href={`/p/${session.handle}/edit`}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <PencilSimple className="h-4 w-4" weight="bold" aria-hidden="true" />
            {t('editProfile')}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent"
            role="menuitem"
          >
            <SignOut className="h-4 w-4" weight="bold" aria-hidden="true" />
            {t('signOut')}
          </button>
        </div>
      )}
    </div>
  );
}
