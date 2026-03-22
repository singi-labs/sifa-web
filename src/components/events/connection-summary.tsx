'use client';

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
  if (!isLoggedIn) {
    return (
      <div className={containerClass}>
        <SignIn size={20} className={iconClass} aria-hidden="true" />
        <p className={textClass}>
          <Link href={loginUrl} className="underline underline-offset-2 hover:text-foreground">
            Sign in with your AT Protocol handle
          </Link>{' '}
          to see who you know at this event.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={containerClass}>
        <SpinnerGap size={20} className={`${iconClass} animate-spin`} aria-hidden="true" />
        <p className={textClass}>Checking your connections...</p>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className={containerClass}>
        <Binoculars size={20} className={iconClass} aria-hidden="true" />
        <p className={textClass}>
          {"None of your Bluesky connections have RSVP'd yet. Discover new connections below!"}
        </p>
      </div>
    );
  }

  const visibleAvatars = connections.slice(0, MAX_AVATARS);
  const remaining = connections.length - MAX_AVATARS;

  return (
    <div className={containerClass}>
      <div className="flex shrink-0 -space-x-2">
        {visibleAvatars.map((person) => (
          <Image
            key={person.did}
            src={person.avatar ?? ''}
            alt={person.displayName ?? 'Connection'}
            width={32}
            height={32}
            className="size-8 rounded-full border-2 border-background object-cover"
            unoptimized
          />
        ))}
        {remaining > 0 && (
          <span className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground">
            +{remaining}
          </span>
        )}
      </div>
      <p className={textClass}>
        <strong>{connections.length} people you know</strong> are attending
      </p>
    </div>
  );
}
