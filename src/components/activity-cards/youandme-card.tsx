'use client';

import { useEffect, useState } from 'react';
import { Handshake } from '@phosphor-icons/react';
import { getAppMeta, getAppStripeColor } from '@/lib/atproto-apps';
import type { ActivityCardProps } from './types';
import { CardLink } from './card-link';
import { ActivityTooltip } from '../activity-tooltip';
import { AppPill } from '../app-pill';

interface ResolvedProfile {
  handle: string;
  displayName: string | null;
  avatar: string | null;
}

const profileCache = new Map<string, ResolvedProfile>();

async function resolveProfile(did: string): Promise<ResolvedProfile | null> {
  if (profileCache.has(did)) return profileCache.get(did)!;
  try {
    const res = await fetch(
      `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(did)}`,
      { signal: AbortSignal.timeout(3000) },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const profile: ResolvedProfile = {
      handle: data.handle ?? did,
      displayName: data.displayName ?? null,
      avatar: data.avatar ?? null,
    };
    profileCache.set(did, profile);
    return profile;
  } catch {
    return null;
  }
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return '';
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function YouAndMeCard({ record, compact }: ActivityCardProps) {
  const appMeta = getAppMeta('youandme');
  const stripeColor = getAppStripeColor('youandme');

  const subjectDid = typeof record.subject === 'string' ? record.subject : null;
  const createdAt = typeof record.createdAt === 'string' ? record.createdAt : null;
  const timestamp = createdAt ? formatRelativeTime(createdAt) : '';

  const [profile, setProfile] = useState<ResolvedProfile | null>(null);

  useEffect(() => {
    if (!subjectDid) return;
    void resolveProfile(subjectDid).then(setProfile);
  }, [subjectDid]);

  const displayName = profile?.displayName ?? profile?.handle ?? subjectDid ?? 'someone';
  const handle = profile?.handle ?? null;
  const sifaUrl = handle ? `/p/${handle}` : subjectDid ? `/p/${subjectDid}` : null;

  if (compact) {
    return (
      <CardLink href={sifaUrl} label={`View ${displayName}'s profile`}>
        <div
          className="flex items-center gap-3 rounded-md border-l-4 px-3 py-2 transition-colors hover:bg-muted/50"
          style={{ borderLeftColor: stripeColor }}
          data-testid="activity-card-compact"
        >
          <Handshake
            className="h-5 w-5 shrink-0 text-muted-foreground"
            weight="regular"
            aria-hidden="true"
          />
          {profile?.avatar && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={profile.avatar} alt="" className="h-5 w-5 shrink-0 rounded-full" />
          )}
          <span className="min-w-0 flex-1 truncate text-sm">Connected with {displayName}</span>
          {timestamp && <span className="shrink-0 text-xs text-muted-foreground">{timestamp}</span>}
        </div>
      </CardLink>
    );
  }

  return (
    <CardLink href={sifaUrl} label={`View ${displayName}'s profile`}>
      <div
        className="flex overflow-hidden rounded-lg border-l-4 bg-card transition-colors hover:bg-muted/50"
        style={{ borderLeftColor: stripeColor }}
        data-testid="activity-card-full"
      >
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start gap-3">
            <Handshake
              className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
              weight="regular"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {profile?.avatar && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={profile.avatar} alt="" className="h-6 w-6 shrink-0 rounded-full" />
                )}
                <p className="text-sm leading-relaxed">
                  Connected with <span className="font-medium">{displayName}</span>
                  {handle && <span className="ml-1 text-muted-foreground">@{handle}</span>}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-border pt-2 text-xs text-muted-foreground">
            <ActivityTooltip
              appName={appMeta.name}
              tooltipDescription={appMeta.tooltipDescription}
              appUrl={appMeta.appUrl}
            >
              <AppPill appId="youandme" name={appMeta.name} />
            </ActivityTooltip>
            {timestamp && (
              <>
                <span aria-hidden="true">&middot;</span>
                <span>{timestamp}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </CardLink>
  );
}
