'use client';

import Link from 'next/link';
import { X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { sanitize } from '@/lib/sanitize';

interface SuggestionCardProps {
  did: string;
  handle: string;
  displayName?: string;
  headline?: string;
  avatarUrl?: string;
  source: string;
  claimed: boolean;
  dismissed?: boolean;
  onDismiss: (did: string) => void;
  onFollow: (did: string) => void;
  onInvite: (did: string) => void;
  onUndismiss?: (did: string) => void;
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
  onInvite,
  onUndismiss,
}: SuggestionCardProps) {
  const initial = (displayName ?? handle).charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border p-4">
      {/* Avatar */}
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="size-10 rounded-full object-cover" />
        ) : (
          initial
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {claimed ? (
            <Link
              href={`/p/${encodeURIComponent(handle)}`}
              className="truncate font-medium hover:underline"
            >
              {sanitize(displayName ?? handle)}
            </Link>
          ) : (
            <span className="truncate font-medium">{sanitize(displayName ?? handle)}</span>
          )}
          <Badge variant="secondary" className="shrink-0 text-xs">
            {source}
          </Badge>
        </div>
        {headline && <p className="truncate text-sm text-muted-foreground">{sanitize(headline)}</p>}
        <p className="truncate text-xs text-muted-foreground">{sanitize(handle)}</p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        {dismissed && onUndismiss ? (
          <Button variant="outline" size="sm" onClick={() => onUndismiss(did)}>
            Unhide
          </Button>
        ) : claimed ? (
          <Button size="sm" onClick={() => onFollow(did)}>
            Follow
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => onInvite(did)}>
            Invite
          </Button>
        )}
        {!dismissed && (
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
    </div>
  );
}
