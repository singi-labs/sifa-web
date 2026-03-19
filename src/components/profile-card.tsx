'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { sanitize } from '@/lib/sanitize';
import { getDisplayLabel } from '@/lib/pds-utils';
import { trackEvent } from '@/lib/analytics';

interface ProfileCardProps {
  handle: string;
  displayName?: string;
  headline?: string;
  avatar?: string;
  currentRole?: string;
  currentCompany?: string;
  claimed?: boolean;
}

export function ProfileCard({
  handle,
  displayName,
  headline,
  avatar,
  currentRole,
  currentCompany,
  claimed,
}: ProfileCardProps) {
  const label = getDisplayLabel(displayName, handle);
  return (
    <Link
      href={`/p/${encodeURIComponent(handle)}`}
      className="block"
      onClick={() => trackEvent('expert-click', { handle })}
    >
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-semibold text-muted-foreground">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt={`${label}'s avatar`}
                className="size-12 rounded-full object-cover"
              />
            ) : (
              label.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium">{sanitize(label)}</p>
              {claimed === false && (
                <span className="inline-flex shrink-0 items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  Unclaimed
                </span>
              )}
            </div>
            {displayName && (
              <p className="truncate text-xs text-muted-foreground">@{sanitize(handle)}</p>
            )}
            {headline && (
              <p className="truncate text-sm text-muted-foreground">{sanitize(headline)}</p>
            )}
            {currentRole && currentCompany && (
              <p className="truncate text-sm text-muted-foreground">
                {sanitize(currentRole)} at {sanitize(currentCompany)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
