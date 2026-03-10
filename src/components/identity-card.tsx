'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ShareNetwork, PencilSimple, CheckCircle } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FollowButton } from '@/components/follow-button';
import type { TrustStat, VerifiedAccount } from '@/lib/types';
import { cn } from '@/lib/utils';

interface IdentityCardProps {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
  headline?: string;
  location?: string;
  website?: string;
  openTo?: string[];
  trustStats?: TrustStat[];
  verifiedAccounts?: VerifiedAccount[];
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  className?: string;
}

export function IdentityCard({
  did,
  handle,
  displayName,
  avatar,
  headline,
  location,
  website,
  openTo,
  trustStats = [],
  verifiedAccounts = [],
  isOwnProfile,
  isFollowing,
  className,
}: IdentityCardProps) {
  const t = useTranslations('identityCard');

  const displayTrustStats =
    trustStats.length > 0
      ? trustStats.slice(0, 3)
      : [
          { key: 'connections', label: t('statConnections'), value: 0 },
          { key: 'endorsements', label: t('statEndorsements'), value: 0 },
          { key: 'reactions', label: t('statReactions'), value: 0 },
        ];

  return (
    <section
      className={cn('rounded-xl border border-border bg-card p-6', className)}
      aria-label={t('label')}
    >
      {/* Row 1: Avatar, name, badges */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xl font-semibold text-muted-foreground">
          {avatar ? (
            <Image
              src={avatar}
              alt={t('avatarAlt', { name: displayName ?? handle })}
              width={64}
              height={64}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <span aria-hidden="true">{(displayName ?? handle).charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-bold">{displayName ?? handle}</h1>
            {verifiedAccounts.length > 0 && (
              <CheckCircle
                className="h-5 w-5 shrink-0 text-primary"
                weight="fill"
                aria-label={t('verified')}
              />
            )}
          </div>
          {/* Row 2: Handle */}
          <p className="truncate text-sm text-muted-foreground">@{handle}</p>
        </div>
      </div>

      {/* Row 3: Headline */}
      {headline && <p className="mt-3 text-base text-foreground">{headline}</p>}

      {/* Row 4: Location + Website */}
      {(location || website) && (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {location && <span>{location}</span>}
          {website && (
            <a
              href={website.startsWith('http') ? website : `https://${website}`}
              className="underline-offset-4 hover:text-foreground hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
      )}

      {/* Row 5: Open to pills */}
      {openTo && openTo.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {openTo.map((item) => (
            <Badge key={item} variant="outline" className="border-primary/30 text-primary">
              {item}
            </Badge>
          ))}
        </div>
      )}

      {/* Row 6: Trust stats */}
      <div className="mt-4 flex gap-6" role="list" aria-label={t('trustStatsLabel')}>
        {displayTrustStats.map((stat) => (
          <div key={stat.key} className="text-center" role="listitem">
            <p className="text-lg font-semibold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Row 7: Action buttons */}
      <div className="mt-4 flex gap-2">
        {isOwnProfile ? (
          <Link
            href={`/p/${handle}/edit`}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <PencilSimple className="h-4 w-4" weight="bold" aria-hidden="true" />
            {t('editProfile')}
          </Link>
        ) : (
          <FollowButton targetDid={did} isFollowing={isFollowing ?? false} />
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            void navigator.clipboard.writeText(`https://sifa.id/p/${handle}`);
          }}
          aria-label={t('shareProfile')}
        >
          <ShareNetwork className="mr-1.5 h-4 w-4" weight="bold" aria-hidden="true" />
          {t('share')}
        </Button>
      </div>
    </section>
  );
}
