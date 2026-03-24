'use client';

import { ShieldCheck, Key } from '@phosphor-icons/react';
import { getAppMeta, getAppStripeColor, resolveCardUrl } from '@/lib/atproto-apps';
import type { ActivityCardProps } from './types';
import { CardLink } from './card-link';
import { AppPill } from '../app-pill';

/** Platform type icons — maps keytrace claim types to display info */
const PLATFORM_INFO: Record<string, { label: string; icon: string }> = {
  dns: { label: 'Domain', icon: '🌐' },
  github: { label: 'GitHub', icon: '🐙' },
  linkedin: { label: 'LinkedIn', icon: '💼' },
  tangled: { label: 'Tangled', icon: '🔗' },
  bluesky: { label: 'Bluesky', icon: '🦋' },
  mastodon: { label: 'Mastodon', icon: '🐘' },
  twitter: { label: 'Twitter/X', icon: '𝕏' },
  website: { label: 'Website', icon: '🌐' },
};

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

export function KeytraceCard({ record, compact, authorHandle }: ActivityCardProps) {
  const appMeta = getAppMeta('keytrace');
  const stripeColor = getAppStripeColor('keytrace');

  const claimType = typeof record.type === 'string' ? record.type : 'unknown';
  const status = typeof record.status === 'string' ? record.status : 'unknown';
  const identity = (record.identity as Record<string, unknown>) ?? {};
  const subject = typeof identity.subject === 'string' ? identity.subject : null;
  const displayName = typeof identity.displayName === 'string' ? identity.displayName : null;
  const profileUrl = typeof identity.profileUrl === 'string' ? identity.profileUrl : null;

  const sigs = Array.isArray(record.sigs) ? record.sigs : [];
  const signedAt =
    sigs.length > 0 && typeof (sigs[0] as Record<string, unknown>)?.signedAt === 'string'
      ? ((sigs[0] as Record<string, unknown>).signedAt as string)
      : null;
  const timestamp = signedAt ? formatRelativeTime(signedAt) : '';

  const platform = PLATFORM_INFO[claimType] ?? { label: claimType, icon: '🔑' };
  const isVerified = status === 'verified';
  const displayLabel = displayName ?? subject ?? claimType;

  const cardUrl = resolveCardUrl('keytrace', { handle: authorHandle });

  if (compact) {
    return (
      <CardLink href={cardUrl} label="View on keytrace.dev">
        <div
          className="flex items-center gap-3 rounded-md border-l-4 px-3 py-2 transition-colors hover:bg-muted/50"
          style={{ borderLeftColor: stripeColor }}
          data-testid="activity-card-compact"
        >
          <Key
            className="h-5 w-5 shrink-0 text-muted-foreground"
            weight="regular"
            aria-hidden="true"
          />
          <span className="text-sm">{platform.icon}</span>
          <span className="min-w-0 flex-1 truncate text-sm">
            Verified {platform.label}: {displayLabel}
          </span>
          {isVerified && (
            <ShieldCheck
              className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
              weight="fill"
              aria-label="Verified"
            />
          )}
          {timestamp && <span className="shrink-0 text-xs text-muted-foreground">{timestamp}</span>}
        </div>
      </CardLink>
    );
  }

  return (
    <CardLink href={cardUrl} label="View on keytrace.dev">
      <div
        className="flex overflow-hidden rounded-lg border-l-4 bg-card transition-colors hover:bg-muted/50"
        style={{ borderLeftColor: stripeColor }}
        data-testid="activity-card-full"
      >
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start gap-3">
            <Key
              className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
              weight="regular"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-base">{platform.icon}</span>
                <p className="text-sm font-medium">
                  Verified {platform.label}
                  {isVerified && (
                    <ShieldCheck
                      className="ml-1 inline h-4 w-4 text-emerald-600 dark:text-emerald-400"
                      weight="fill"
                      aria-label="Verified"
                    />
                  )}
                </p>
              </div>
              {profileUrl ? (
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 mt-1 block text-sm text-primary underline-offset-4 hover:underline"
                >
                  {displayLabel}
                </a>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">{displayLabel}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-border pt-2 text-xs text-muted-foreground">
            <AppPill appId="keytrace" name={appMeta.name} />
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
