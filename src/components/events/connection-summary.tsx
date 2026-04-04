'use client';

import { useTranslations } from 'next-intl';
import { Binoculars, SignIn, SpinnerGap } from '@phosphor-icons/react';
import Image from 'next/image';
import Link from 'next/link';

export interface ConnectionPerson {
  did: string;
  displayName?: string;
  avatar?: string;
}

export interface ConnectionSummaryProps {
  isLoggedIn: boolean;
  isLoading: boolean;
  connections: ConnectionPerson[];
  loginUrl?: string;
}

const MAX_AVATARS = 4;

const containerClass =
  'flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3';
const iconClass = 'shrink-0 text-muted-foreground';
const textClass = 'text-sm';

export function ConnectionSummary({
  isLoggedIn,
  isLoading,
  connections,
  loginUrl = '/login',
}: ConnectionSummaryProps): React.ReactNode {
  const t = useTranslations('connectionSummary');

  if (!isLoggedIn) {
    return (
      <div className={containerClass}>
        <SignIn size={20} className={iconClass} aria-hidden="true" />
        <p className={textClass}>
          <Link href={loginUrl} className="underline underline-offset-2 hover:text-foreground">
            {t('signInLink')}
          </Link>{' '}
          {t('signInSuffix')}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={containerClass}>
        <SpinnerGap size={20} className={`${iconClass} animate-spin`} aria-hidden="true" />
        <p className={textClass}>{t('loading')}</p>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className={containerClass}>
        <Binoculars size={20} className={iconClass} aria-hidden="true" />
        <p className={textClass}>{t('noConnections')}</p>
      </div>
    );
  }

  const visibleAvatars = connections.slice(0, MAX_AVATARS);
  const remaining = connections.length - MAX_AVATARS;

  return (
    <div className={containerClass}>
      <div className="flex shrink-0 -space-x-2">
        {visibleAvatars.map((person) =>
          person.avatar ? (
            <Image
              key={person.did}
              src={person.avatar}
              alt={person.displayName ?? 'Connection'}
              width={32}
              height={32}
              className="size-8 rounded-full border-2 border-background object-cover"
            />
          ) : (
            <span
              key={person.did}
              className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground"
              aria-hidden="true"
            >
              {(person.displayName ?? '?')[0]?.toUpperCase()}
            </span>
          ),
        )}
        {remaining > 0 && (
          <span className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground">
            +{remaining}
          </span>
        )}
      </div>
      <p className={textClass}>
        <strong>{t('attendingCount', { count: String(connections.length) })}</strong>{' '}
        {t('attending')}
      </p>
    </div>
  );
}
