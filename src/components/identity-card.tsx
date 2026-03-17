'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Popover } from '@base-ui/react/popover';
import { ShareNetwork, PencilSimple, CheckCircle, Check, Code } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { FollowButton } from '@/components/follow-button';
import { PdsIcon } from '@/components/pds-icon';
import { ProfileEditDialog } from '@/components/profile-edit-dialog';
import { useAuth } from '@/components/auth-provider';
import type {
  ActiveApp,
  LocationValue,
  PdsProviderInfo,
  TrustStat,
  VerifiedAccount,
} from '@/lib/types';
import { formatLocation, countryCodeToFlag } from '@/lib/location-utils';
import { detectPdsProvider, getDisplayLabel, pdsProviderFromApi } from '@/lib/pds-utils';
import { getAppMeta } from '@/lib/atproto-apps';
import { formatCompactNumber } from '@/i18n/format';
import { resolveDisplayFollowers } from '@/lib/follower-utils';
import { cn } from '@/lib/utils';

const OPEN_TO_LABEL_KEYS: Record<string, string> = {
  'id.sifa.defs#fullTimeRoles': 'fullTimeRoles',
  'id.sifa.defs#partTimeRoles': 'partTimeRoles',
  'id.sifa.defs#contractRoles': 'contractRoles',
  'id.sifa.defs#boardPositions': 'boardPositions',
  'id.sifa.defs#mentoring': 'mentoring',
  'id.sifa.defs#collaborations': 'collaborations',
};

interface IdentityCardProps {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
  headline?: string;
  about?: string;
  currentRole?: string;
  currentCompany?: string;
  location?: LocationValue | null;
  website?: string;
  openTo?: string[];
  followersCount?: number;
  atprotoFollowersCount?: number;
  trustStats?: TrustStat[];
  verifiedAccounts?: VerifiedAccount[];
  activeApps?: ActiveApp[];
  pdsProviderInfo?: PdsProviderInfo | null;
  claimed: boolean;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  variant?: 'page' | 'embed';
  badge?: string;
  hideFooter?: boolean;
  className?: string;
}

export function IdentityCard({
  did,
  handle,
  displayName,
  avatar,
  headline,
  about,
  currentRole,
  currentCompany,
  location,
  website,
  openTo,
  followersCount,
  atprotoFollowersCount,
  trustStats = [],
  verifiedAccounts = [],
  activeApps = [],
  pdsProviderInfo,
  claimed,
  isOwnProfile,
  isFollowing,
  variant = 'page',
  badge,
  hideFooter,
  className,
}: IdentityCardProps) {
  const t = useTranslations('identityCard');
  const tEdit = useTranslations('profileEdit');
  const { session } = useAuth();
  const isEmbed = variant === 'embed';
  const isOwn = isOwnProfile || Boolean(session?.did && session.did === did);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const pdsProvider = pdsProviderFromApi(pdsProviderInfo, handle) ?? detectPdsProvider(handle);
  const label = getDisplayLabel(displayName, handle);
  const displayFollowers = resolveDisplayFollowers(atprotoFollowersCount, followersCount);

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
      className={cn('relative rounded-xl border border-border bg-card p-6', className)}
      aria-label={t('label')}
    >
      {isEmbed ? (
        <>
          {/* Embed layout: avatar-left, compact */}
          <div className="flex items-start gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-lg font-semibold text-muted-foreground">
              {avatar ? (
                <Image
                  src={avatar}
                  alt={t('avatarAlt', { name: label })}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <span aria-hidden="true">{label.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h1 className="truncate text-base font-bold">{label}</h1>
                {verifiedAccounts.length > 0 && (
                  <CheckCircle
                    className="h-4 w-4 shrink-0 text-primary"
                    weight="fill"
                    aria-label={t('verified')}
                  />
                )}
              </div>
              {badge && (
                <Badge
                  variant="secondary"
                  className="mt-0.5 w-fit px-1.5 py-0 text-[10px] font-medium"
                >
                  {badge}
                </Badge>
              )}
              <div className="flex items-center gap-2">
                {pdsProvider ? (
                  <a
                    href={pdsProvider.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 truncate text-xs text-muted-foreground hover:text-foreground"
                  >
                    <PdsIcon provider={pdsProvider.name} className="h-3 w-3 shrink-0" />@{handle}
                  </a>
                ) : (
                  <p className="truncate text-xs text-muted-foreground">@{handle}</p>
                )}
              </div>
            </div>
          </div>

          {(headline || about) && (
            <p className="mt-2 line-clamp-2 text-sm text-foreground">
              {headline ?? (about && about.length > 120 ? about.slice(0, 120) + '\u2026' : about)}
            </p>
          )}

          {currentRole && currentCompany && (
            <p className="mt-1 text-xs text-muted-foreground">
              {currentRole} {t('roleAt')} {currentCompany}
            </p>
          )}

          {(location || website) && (
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              {location && (
                <span>
                  {formatLocation(location)}
                  {location.countryCode && (
                    <span className="ml-1" role="img" aria-label={location.countryCode}>
                      {countryCodeToFlag(location.countryCode)}
                    </span>
                  )}
                </span>
              )}
              {website && (
                <a
                  href={website.startsWith('http') ? website : `https://${website}`}
                  className="underline-offset-4 hover:text-foreground hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                </a>
              )}
            </div>
          )}

          {/* Open to pills */}
          {openTo && openTo.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">{tEdit('openTo')}:</span>
              {openTo.map((item) => (
                <Badge
                  key={item}
                  variant="outline"
                  className="border-primary/30 px-2 py-0 text-xs text-primary"
                >
                  {OPEN_TO_LABEL_KEYS[item] ? tEdit(OPEN_TO_LABEL_KEYS[item]!) : item}
                </Badge>
              ))}
            </div>
          )}

          {/* Activity indicators: follower count */}
          {displayFollowers ? (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>
                {displayFollowers.source === 'atproto'
                  ? t('followersOnBluesky', {
                      count: formatCompactNumber(displayFollowers.count, 'en'),
                    })
                  : t('followers', { count: formatCompactNumber(displayFollowers.count, 'en') })}
              </span>
            </div>
          ) : null}

          {/* Active ATproto apps */}
          {activeApps.length > 0 && (
            <div
              className="mt-2 flex flex-wrap gap-1"
              role="list"
              aria-label={t('activeAppsLabel')}
            >
              {activeApps.map((app) => {
                const meta = getAppMeta(app.id);
                return (
                  <span
                    key={app.id}
                    role="listitem"
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-medium',
                      meta.className,
                    )}
                    aria-label={t('activeOn', { app: meta.name })}
                  >
                    {meta.name}
                  </span>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Page layout: original horizontal avatar + text */}
          {/* Row 1: Avatar, name, badges */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xl font-semibold text-muted-foreground">
              {avatar ? (
                <Image
                  src={avatar}
                  alt={t('avatarAlt', { name: label })}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <span aria-hidden="true">{label.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-xl font-bold">{label}</h1>
                {verifiedAccounts.length > 0 && (
                  <CheckCircle
                    className="h-5 w-5 shrink-0 text-primary"
                    weight="fill"
                    aria-label={t('verified')}
                  />
                )}
              </div>
              {/* Row 2: Handle + unclaimed badge */}
              <div className="flex items-center gap-2">
                {pdsProvider ? (
                  <a
                    href={pdsProvider.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 truncate text-sm text-muted-foreground hover:text-foreground"
                  >
                    <PdsIcon provider={pdsProvider.name} className="h-3.5 w-3.5 shrink-0" />@
                    {handle}
                  </a>
                ) : (
                  <p className="truncate text-sm text-muted-foreground">@{handle}</p>
                )}
                {!claimed && (
                  <Popover.Root>
                    <Popover.Trigger className="inline-flex h-5 shrink-0 cursor-pointer items-center rounded-full border border-amber-300 bg-amber-50 px-2 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300 dark:hover:bg-amber-900/50">
                      {t('unclaimed')}
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Positioner sideOffset={8}>
                        <Popover.Popup className="z-50 w-64 rounded-lg border border-border bg-popover p-3 text-sm text-popover-foreground shadow-md">
                          <Popover.Arrow className="fill-popover stroke-border" />
                          <p className="text-muted-foreground">
                            {t('unclaimedPopupText', { name: label })}
                          </p>
                          {!session && (
                            <Link
                              href={`/login?returnTo=${typeof window !== 'undefined' ? encodeURIComponent(window.location.pathname) : ''}`}
                              className="mt-2 inline-block text-sm font-medium text-amber-700 underline underline-offset-4 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200"
                            >
                              {t('claimYourProfile')}
                            </Link>
                          )}
                        </Popover.Popup>
                      </Popover.Positioner>
                    </Popover.Portal>
                  </Popover.Root>
                )}
              </div>
            </div>
          </div>

          {/* Row 3: Headline (falls back to truncated about when no headline) */}
          {(headline || about) && (
            <p className="mt-3 text-base text-foreground">
              {headline ?? (about && about.length > 120 ? about.slice(0, 120) + '\u2026' : about)}
            </p>
          )}

          {/* Row 4: Current role */}
          {currentRole && currentCompany && (
            <p className="mt-2 text-sm text-muted-foreground">
              {currentRole} {t('roleAt')} {currentCompany}
            </p>
          )}

          {/* Row 5: Location + Website */}
          {(location || website) && (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {location && (
                <span>
                  {formatLocation(location)}
                  {location.countryCode && (
                    <span className="ml-1" role="img" aria-label={location.countryCode}>
                      {countryCodeToFlag(location.countryCode)}
                    </span>
                  )}
                </span>
              )}
              {website && (
                <a
                  href={website.startsWith('http') ? website : `https://${website}`}
                  className="underline-offset-4 hover:text-foreground hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                </a>
              )}
            </div>
          )}

          {/* Row 5b: Follower count */}
          {displayFollowers ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>
                {displayFollowers.source === 'atproto'
                  ? t('followersOnBluesky', {
                      count: formatCompactNumber(displayFollowers.count, 'en'),
                    })
                  : t('followers', { count: formatCompactNumber(displayFollowers.count, 'en') })}
              </span>
            </div>
          ) : null}

          {/* Row 6: Open to pills */}
          {openTo && openTo.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">{tEdit('openTo')}:</span>
              {openTo.map((item) => (
                <Badge key={item} variant="outline" className="border-primary/30 text-primary">
                  {OPEN_TO_LABEL_KEYS[item] ? tEdit(OPEN_TO_LABEL_KEYS[item]!) : item}
                </Badge>
              ))}
            </div>
          )}

          {/* Row 7: Trust stats */}
          <div className="mt-4 flex gap-6" role="list" aria-label={t('trustStatsLabel')}>
            {displayTrustStats.map((stat) => (
              <div key={stat.key} className="text-center" role="listitem">
                <p className="text-lg font-semibold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Floating edit button — top-right, own profile only, not in embeds */}
      {isOwn && !isEmbed && (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="absolute right-4 top-4 inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <PencilSimple className="h-4 w-4" weight="bold" aria-hidden="true" />
          {t('editProfile')}
        </button>
      )}

      {/* Row 8: Action buttons (page) or "View on Sifa" CTA (embed) */}
      {isEmbed && !hideFooter && (
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <a
            href={`https://sifa.id/p/${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-primary hover:underline"
          >
            {t('viewOnSifa')}
          </a>
          <svg
            viewBox="0 0 256 256"
            className="h-4 w-4 text-muted-foreground/50"
            role="img"
            aria-label="Sifa"
          >
            <g transform="matrix(0.333333,0,0,0.333333,37.583333,37.083333)">
              <path
                d="M128,71.5C159.183,71.5 184.5,96.817 184.5,128C184.5,159.183 159.183,184.5 128,184.5C96.817,184.5 71.5,159.183 71.5,128C71.5,96.817 96.817,71.5 128,71.5ZM128,104.5C115.03,104.5 104.5,115.03 104.5,128C104.5,140.97 115.03,151.5 128,151.5C140.97,151.5 151.5,140.97 151.5,128C151.5,115.03 140.97,104.5 128,104.5Z"
                fill="currentColor"
              />
            </g>
            <g transform="matrix(0.333333,0,0,0.333333,37.583333,37.083333)">
              <path
                d="M174.866,194.259C182.45,189.218 192.7,191.282 197.741,198.866C202.782,206.45 200.718,216.7 193.134,221.741C175.432,233.507 150.846,240.5 128,240.5C66.284,240.5 15.5,189.716 15.5,128C15.5,66.284 66.284,15.5 128,15.5C189.716,15.5 240.5,66.284 240.5,128C240.5,160.538 225.46,184.5 196,184.5C166.54,184.5 151.5,160.538 151.5,128L151.5,88C151.5,78.893 158.893,71.5 168,71.5C177.107,71.5 184.5,78.893 184.5,88L184.5,128C184.5,134.408 185.237,140.363 187.279,145.164C188.851,148.858 191.536,151.5 196,151.5C200.464,151.5 203.149,148.858 204.721,145.164C206.763,140.363 207.5,134.408 207.5,128C207.5,84.388 171.612,48.5 128,48.5C84.388,48.5 48.5,84.388 48.5,128C48.5,171.612 84.388,207.5 128,207.5C144.415,207.5 162.148,202.713 174.866,194.259Z"
                fill="currentColor"
              />
            </g>
            <path
              d="M176,47.75 L208,79.75 L176,111.75 L144,79.75 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
            />
            <path
              d="M80,144 L112,176 L80,208 L48,176 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
            />
            <path
              d="M152,192 L176,160 L200,192"
              fill="none"
              stroke="currentColor"
              strokeWidth="11"
            />
          </svg>
        </div>
      )}
      {!isEmbed && (
        <div className="mt-4 flex gap-2">
          {!isOwn && <FollowButton targetDid={did} isFollowing={isFollowing ?? false} />}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              void navigator.clipboard.writeText(`https://sifa.id/p/${handle}`).then(() => {
                setCopied(true);
                toast.success(t('linkCopied'));
                setTimeout(() => setCopied(false), 2000);
              });
            }}
            aria-label={t('shareProfile')}
          >
            {copied ? (
              <>
                <Check className="mr-1.5 h-4 w-4 text-green-600" weight="bold" aria-hidden="true" />
                {t('copied')}
              </>
            ) : (
              <>
                <ShareNetwork className="mr-1.5 h-4 w-4" weight="bold" aria-hidden="true" />
                {t('share')}
              </>
            )}
          </Button>
          {isOwn && (
            <Link
              href={`/embed?handle=${encodeURIComponent(handle)}`}
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
            >
              <Code className="mr-1.5 h-4 w-4" weight="bold" aria-hidden="true" />
              {t('embed')}
            </Link>
          )}
        </div>
      )}
      {editing && (
        <ProfileEditDialog
          handle={handle}
          did={did}
          displayName={displayName}
          avatar={avatar}
          headline={headline}
          about={about}
          location={location}
          openTo={openTo}
          onClose={() => setEditing(false)}
        />
      )}
    </section>
  );
}
