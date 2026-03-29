'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { sanitize } from '@/lib/sanitize';
import { getDisplayLabel } from '@/lib/pds-utils';

interface SuggestionCardProps {
  did: string;
  handle: string;
  displayName?: string;
  headline?: string;
  avatarUrl?: string;
  source: string;
  claimed: boolean;
  dismissed?: boolean;
  onDismiss?: (did: string) => void;
  onFollow?: (did: string) => void;
  onUndismiss?: (did: string) => void;
  onUnfollow?: (did: string) => void;
}

export function SuggestionCard({
  did,
  handle,
  displayName,
  headline,
  avatarUrl,
  source,
  claimed,
  dismissed,
  onDismiss,
  onFollow,
  onUndismiss,
  onUnfollow,
}: SuggestionCardProps) {
  const label = getDisplayLabel(displayName, handle);
  const initial = label.charAt(0).toUpperCase();

  return (
    <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-1 rounded-lg border border-border p-4 sm:items-center sm:gap-x-4">
      {/* Avatar - spans both rows on mobile */}
      <div className="row-span-2 mt-0.5 flex size-10 shrink-0 items-center justify-center self-start rounded-full bg-muted text-sm font-semibold text-muted-foreground sm:row-span-1 sm:mt-0 sm:self-center">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-full object-cover"
          />
        ) : (
          initial
        )}
      </div>

      {/* Info */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {claimed ? (
            <Link
              href={`/p/${encodeURIComponent(handle)}`}
              className="truncate font-medium hover:underline"
            >
              {sanitize(label)}
            </Link>
          ) : (
            <a
              href={`https://bsky.app/profile/${encodeURIComponent(handle)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate font-medium hover:underline"
            >
              {sanitize(label)}
            </a>
          )}
          <Badge variant="secondary" className="shrink-0 text-xs">
            {source}
          </Badge>
        </div>
        {headline && <p className="truncate text-sm text-muted-foreground">{sanitize(headline)}</p>}
        {handle && <p className="truncate text-xs text-muted-foreground">{sanitize(handle)}</p>}
      </div>

      {/* Dismiss - top right on mobile, inline on desktop */}
      <div className="flex items-start gap-2 sm:items-center">
        {!dismissed && onDismiss && (
          <button
            type="button"
            onClick={() => onDismiss(did)}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Dismiss suggestion"
          >
            <X className="size-4" weight="bold" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Actions - second row on mobile (col 2), part of first row on desktop */}
      <div className="col-start-2 sm:col-start-auto sm:row-start-1">
        {onUnfollow ? (
          <Button variant="outline" size="sm" onClick={() => onUnfollow(did)}>
            Unfollow
          </Button>
        ) : dismissed && onUndismiss ? (
          <Button variant="outline" size="sm" onClick={() => onUndismiss(did)}>
            Unhide
          </Button>
        ) : claimed && onFollow ? (
          <Button size="sm" onClick={() => onFollow(did)}>
            Follow
          </Button>
        ) : null}
      </div>
    </div>
  );
}
