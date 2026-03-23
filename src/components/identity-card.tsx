'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Popover } from '@base-ui/react/popover';
import {
  ShareNetwork,
  PencilSimple,
  CheckCircle,
  Check,
  Code,
  Eye,
  MapPin,
  LinkSimple,
  Briefcase,
  Buildings,
} from '@phosphor-icons/react';
import { useProfileEdit } from '@/components/profile-edit-provider';
import { ConnectionBadge } from '@/components/events/connection-badge';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { FollowButton } from '@/components/follow-button';
import { ProfileEditDialog } from '@/components/profile-edit-dialog';
import { ActivityIndicators } from '@/components/activity-indicators';
import { useAuth } from '@/components/auth-provider';
import type {
  ActiveApp,
  LocationValue,
  PdsProviderInfo,
  TrustStat,
  VerifiedAccount,
} from '@/lib/types';
import { formatLocation, countryCodeToFlag } from '@/lib/location-utils';
import { getDisplayLabel } from '@/lib/pds-utils';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

const OPEN_TO_LABEL_KEYS: Record<string, string> = {
  'id.sifa.defs#fullTimeRoles': 'fullTimeRoles',
  'id.sifa.defs#partTimeRoles': 'partTimeRoles',
  'id.sifa.defs#contractRoles': 'contractRoles',
  'id.sifa.defs#boardPositions': 'boardPositions',
  'id.sifa.defs#mentoringOthers': 'mentoringOthers',
  'id.sifa.defs#beingMentored': 'beingMentored',
  'id.sifa.defs#mentoring': 'mentoringOthers', // backwards compat: old value maps to "Mentoring others"
  'id.sifa.defs#collaborations': 'collaborations',
};

const PREFERRED_WORKPLACE_LABEL_KEYS: Record<string, string> = {
  'id.sifa.defs#onSite': 'onSite',
  'id.sifa.defs#remote': 'remote',
  'id.sifa.defs#hybrid': 'hybrid',
};

interface FeaturedSkill {
  rkey: string;
  skillName: string;
}

interface IdentityCardProps {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
  pronouns?: string;
  headline?: string;
  about?: string;
  currentRole?: string;
  currentCompany?: string;
  location?: LocationValue | null;
  website?: string;
  openTo?: string[];
  preferredWorkplace?: string[];
  featuredSkills?: FeaturedSkill[];
  // Kept for caller compatibility -- no longer rendered on the card
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
  connectionType?: 'mutual' | 'following' | 'followedBy';
  hideFooter?: boolean;
  className?: string;
  hasDisplayNameOverride?: boolean;
  hasAvatarUrlOverride?: boolean;
  sourceDisplayName?: string;
  sourceAvatar?: string;
}

export function IdentityCard({
  did,
  handle,
  displayName,
  avatar,
  pronouns,
  headline,
  about,
  currentRole,
  currentCompany,
  location,
  website,
  openTo,
  preferredWorkplace,
  featuredSkills = [],
  // Destructured but not rendered (callers still pass these)
  followersCount: _followersCount,
  atprotoFollowersCount: _atprotoFollowersCount,
  trustStats: _trustStats = [],
  verifiedAccounts = [],
  activeApps = [],
  pdsProviderInfo: _pdsProviderInfo,
  claimed,
  isOwnProfile,
  isFollowing,
  variant = 'page',
  badge,
  connectionType,
  hideFooter,
  className,
  hasDisplayNameOverride,
  hasAvatarUrlOverride,
  sourceDisplayName,
  sourceAvatar,
}: IdentityCardProps) {
  const t = useTranslations('identityCard');
  const tEdit = useTranslations('profileEdit');
  const { session } = useAuth();
  const tProfile = useTranslations('profile');
  const isEmbed = variant === 'embed';
  const { isActualOwner, previewMode, togglePreview } = useProfileEdit();
  const isOwn = isOwnProfile || Boolean(session?.did && session.did === did);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const label = getDisplayLabel(displayName, handle);

  return (
    <section
      className={cn('relative rounded-xl border border-border bg-card p-6', className)}
      aria-label={t('label')}
    >
      {isEmbed ? (
        <>
          {/* Embed layout: compact two-column with avatar left */}
          <div className="flex items-start gap-4">
            <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xl font-semibold text-muted-foreground">
              {avatar ? (
                <Image
                  src={avatar}
                  alt=""
                  width={72}
                  height={72}
                  className="h-[72px] w-[72px] rounded-full object-cover"
                />
              ) : (
                <span aria-hidden="true">{label.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              {/* Name + pronouns + verified */}
              <div className="flex items-center gap-1.5">
                {/* h1 is correct here: embed renders in an isolated iframe document */}
                <h1 className="truncate text-base font-semibold">{label}</h1>
                {pronouns && (
                  <span className="text-xs font-normal text-muted-foreground">({pronouns})</span>
                )}
                {verifiedAccounts.length > 0 && (
                  <CheckCircle
                    className="h-4 w-4 shrink-0 text-primary"
                    weight="fill"
                    aria-label={t('verified')}
                  />
                )}
              </div>

              {/* Handle */}
              <div className="text-xs text-muted-foreground">
                <a
                  href={`https://bsky.app/profile/${handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate hover:text-foreground"
                >
                  @{handle}
                </a>
              </div>

              {(badge || connectionType) && (
                <div className="mt-0.5 flex flex-wrap items-center gap-1">
                  {badge && (
                    <Badge
                      variant="secondary"
                      className="w-fit px-1.5 py-0 text-[10px] font-medium"
                    >
                      {badge}
                    </Badge>
                  )}
                  {connectionType && <ConnectionBadge type={connectionType} handle={handle} />}
                </div>
              )}

              {/* Role at company */}
              {currentRole && currentCompany && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {currentRole} {t('roleAt')} {currentCompany}
                </p>
              )}

              {/* Location + website (icon-led rows) */}
              {(location || website) && (
                <div className="mt-1 space-y-0.5">
                  {location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" weight="regular" aria-hidden="true" />
                      <span>
                        {formatLocation(location)}
                        {location.countryCode && (
                          <span className="ml-0.5" role="img" aria-label={location.countryCode}>
                            {countryCodeToFlag(location.countryCode)}
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  {website && isSafeUrl(website) && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <LinkSimple
                        className="h-3 w-3 shrink-0"
                        weight="regular"
                        aria-hidden="true"
                      />
                      <a
                        href={website.startsWith('http') ? website : `https://${website}`}
                        className="truncate underline-offset-4 hover:text-foreground hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Headline (below avatar row, full width) */}
          {(headline || about) && (
            <p className="mt-3 line-clamp-2 text-sm text-foreground">
              {headline ?? (about && about.length > 120 ? about.slice(0, 120) + '\u2026' : about)}
            </p>
          )}

          {/* Condensed availability badge */}
          {openTo && openTo.length > 0 && (
            <div className="mt-2">
              <Badge
                variant="outline"
                className="border-primary/30 px-2 py-0.5 text-xs text-primary"
              >
                <Briefcase className="mr-1 h-3 w-3" weight="regular" aria-hidden="true" />
                {t('availableForWork')}
              </Badge>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Page layout: Zone A - Identity */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
            {/* Avatar */}
            <div className="flex h-24 w-24 shrink-0 self-center items-center justify-center overflow-hidden rounded-full bg-muted text-2xl font-semibold text-muted-foreground sm:self-auto">
              {avatar ? (
                <Image
                  src={avatar}
                  alt=""
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <span aria-hidden="true">{label.charAt(0).toUpperCase()}</span>
              )}
            </div>

            {/* Identity text */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-lg font-semibold">{label}</h1>
                {pronouns && (
                  <span className="text-sm font-normal text-muted-foreground">({pronouns})</span>
                )}
                {verifiedAccounts.length > 0 && (
                  <CheckCircle
                    className="h-5 w-5 shrink-0 text-primary"
                    weight="fill"
                    aria-label={t('verified')}
                  />
                )}
              </div>

              {/* Handle + unclaimed badge */}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <a
                  href={`https://bsky.app/profile/${handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate hover:text-foreground"
                >
                  @{handle}
                </a>
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

          {/* Zone B: Professional Context */}
          {(headline ||
            about ||
            currentRole ||
            location ||
            website ||
            featuredSkills.length > 0) && (
            <div className="mt-4 space-y-1" data-testid="zone-b">
              {/* Headline */}
              {(headline || about) && (
                <p className="text-[15px] text-foreground">
                  {headline ??
                    (about && about.length > 120 ? about.slice(0, 120) + '\u2026' : about)}
                </p>
              )}

              {/* Current role */}
              {currentRole && currentCompany && (
                <p className="text-sm text-muted-foreground">
                  {currentRole} {t('roleAt')} {currentCompany}
                </p>
              )}

              {/* Icon-led metadata rows */}
              {(location || website) && (
                <div className="mt-1 space-y-0.5">
                  {location && (
                    <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" weight="regular" aria-hidden="true" />
                      <span>
                        {formatLocation(location)}
                        {location.countryCode && (
                          <span className="ml-1" role="img" aria-label={location.countryCode}>
                            {countryCodeToFlag(location.countryCode)}
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  {website && isSafeUrl(website) && (
                    <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                      <LinkSimple
                        className="h-4 w-4 shrink-0"
                        weight="regular"
                        aria-hidden="true"
                      />
                      <a
                        href={website.startsWith('http') ? website : `https://${website}`}
                        className="underline-offset-4 hover:text-foreground hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Featured skills pills */}
              {featuredSkills.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={t('featuredSkillsLabel')}>
                  {featuredSkills.slice(0, 3).map((skill) => (
                    <li key={skill.rkey}>
                      <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                        {skill.skillName}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Zone C: Signals & Actions */}
          {((openTo && openTo.length > 0) ||
            (preferredWorkplace && preferredWorkplace.length > 0)) && (
            <div className="mt-4 space-y-1.5">
              {openTo && openTo.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <Briefcase
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    weight="regular"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium text-muted-foreground">
                    {tEdit('openTo')}:
                  </span>
                  {openTo.map((item) => (
                    <Badge key={item} variant="outline" className="border-primary/30 text-primary">
                      {OPEN_TO_LABEL_KEYS[item] ? tEdit(OPEN_TO_LABEL_KEYS[item]!) : item}
                    </Badge>
                  ))}
                </div>
              )}
              {preferredWorkplace && preferredWorkplace.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <Buildings
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    weight="regular"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium text-muted-foreground">
                    {tEdit('preferredWorkplace')}:
                  </span>
                  {preferredWorkplace.map((item) => (
                    <Badge key={item} variant="outline" className="border-primary/30 text-primary">
                      {PREFERRED_WORKPLACE_LABEL_KEYS[item]
                        ? tEdit(PREFERRED_WORKPLACE_LABEL_KEYS[item]!)
                        : item}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Floating edit/preview buttons -- top-right, own profile only, not in embeds */}
      {isActualOwner && !isEmbed && (
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <button
            type="button"
            onClick={togglePreview}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-pressed={previewMode}
            title={tProfile('previewPublic')}
          >
            <Eye className="h-4 w-4" weight={previewMode ? 'fill' : 'bold'} aria-hidden="true" />
            {tProfile('previewPublic')}
          </button>
          {!previewMode && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <PencilSimple className="h-4 w-4" weight="bold" aria-hidden="true" />
              {t('editProfile')}
            </button>
          )}
        </div>
      )}

      {/* Active-on badges (embed only, inside the card border) */}
      {isEmbed && activeApps.length > 0 && (
        <div className="px-0 pt-3">
          <ActivityIndicators apps={activeApps} maxVisible={2} />
        </div>
      )}

      {/* Action buttons (page) or "View on Sifa" CTA (embed) */}
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
              trackEvent('share-click', { handle });
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
          preferredWorkplace={preferredWorkplace}
          hasDisplayNameOverride={hasDisplayNameOverride}
          hasAvatarUrlOverride={hasAvatarUrlOverride}
          sourceDisplayName={sourceDisplayName}
          sourceAvatar={sourceAvatar}
          onClose={() => setEditing(false)}
        />
      )}
    </section>
  );
}
