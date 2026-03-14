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
import type { LocationValue, TrustStat, VerifiedAccount } from '@/lib/types';
import { formatLocation, countryCodeToFlag } from '@/lib/location-utils';
import { detectPdsProvider } from '@/lib/pds-utils';
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
  trustStats?: TrustStat[];
  verifiedAccounts?: VerifiedAccount[];
  claimed: boolean;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  variant?: 'page' | 'embed';
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
  trustStats = [],
  verifiedAccounts = [],
  claimed,
  isOwnProfile,
  isFollowing,
  variant = 'page',
  className,
}: IdentityCardProps) {
  const t = useTranslations('identityCard');
  const tEdit = useTranslations('profileEdit');
  const { session } = useAuth();
  const isEmbed = variant === 'embed';
  const isOwn = isOwnProfile || Boolean(session?.did && session.did === did);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const pdsProvider = detectPdsProvider(handle);

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
          {/* Embed layout: two-column with avatar on the right */}
          <div className="flex gap-4">
            {/* Left column: text content */}
            <div className="min-w-0 flex-1">
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
              <div className="flex items-center gap-2">
                {pdsProvider ? (
                  <a
                    href={pdsProvider.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 truncate text-sm text-muted-foreground hover:text-foreground"
                  >
                    <PdsIcon provider={pdsProvider.name} className="h-3.5 w-3.5 shrink-0" />@{handle}
                  </a>
                ) : (
                  <p className="truncate text-sm text-muted-foreground">@{handle}</p>
                )}
              </div>

              {(headline || about) && (
                <p className="mt-2 text-sm text-foreground">
                  {headline ?? (about && about.length > 120 ? about.slice(0, 120) + '\u2026' : about)}
                </p>
              )}

              {currentRole && currentCompany && (
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {currentRole} {t('roleAt')} {currentCompany}
                </p>
              )}

              {(location || website) && (
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
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
            </div>

            {/* Right column: avatar */}
            <div className="flex shrink-0 flex-col items-center gap-3">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-muted text-2xl font-semibold text-muted-foreground">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt={t('avatarAlt', { name: displayName ?? handle })}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <span aria-hidden="true">{(displayName ?? handle).charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
          </div>

          {/* Open to pills — full width below the two columns */}
          {openTo && openTo.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {openTo.map((item) => (
                <Badge key={item} variant="outline" className="border-primary/30 text-primary">
                  {OPEN_TO_LABEL_KEYS[item] ? tEdit(OPEN_TO_LABEL_KEYS[item]!) : item}
                </Badge>
              ))}
            </div>
          )}

          {/* Trust stats — full width */}
          <div className="mt-4 flex gap-6" role="list" aria-label={t('trustStatsLabel')}>
            {displayTrustStats.map((stat) => (
              <div key={stat.key} className="text-center" role="listitem">
                <p className="text-lg font-semibold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
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
              {/* Row 2: Handle + unclaimed badge */}
              <div className="flex items-center gap-2">
                {pdsProvider ? (
                  <a
                    href={pdsProvider.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 truncate text-sm text-muted-foreground hover:text-foreground"
                  >
                    <PdsIcon provider={pdsProvider.name} className="h-3.5 w-3.5 shrink-0" />@{handle}
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
                            {t('unclaimedPopupText', { name: displayName ?? handle })}
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

          {/* Row 6: Open to pills */}
          {openTo && openTo.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
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
      {isEmbed ? (
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <a
            href={`https://sifa.id/p/${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-primary hover:underline"
          >
            {t('viewOnSifa')}
          </a>
          <Image
            src="/icon.svg"
            alt="Sifa"
            width={16}
            height={16}
            className="opacity-50"
          />
        </div>
      ) : (
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
