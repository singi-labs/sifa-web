'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IdentityCard } from '@/components/identity-card';
import { Badge } from '@/components/ui/badge';
import { resolveDisplayFollowers } from '@/lib/follower-utils';
import { pdsProviderFromApi } from '@/lib/pds-utils';
import { PdsIcon } from '@/components/pds-icon';
import type {
  ActiveApp,
  LocationValue,
  PdsProviderInfo,
  ProfilePosition,
  TrustStat,
  VerifiedAccount,
} from '@/lib/types';

export type FilterGroup = 'presentation' | 'lightning' | 'panel' | 'workshop' | 'attendee';

export interface EventEntry {
  profile: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
    headline?: string;
    about?: string;
    positions?: ProfilePosition[];
    locationCountry?: string;
    countryCode?: string;
    locationRegion?: string;
    locationCity?: string;
    website?: string;
    openTo?: string[];
    followersCount?: number;
    atprotoFollowersCount?: number;
    trustStats?: TrustStat[];
    verifiedAccounts?: VerifiedAccount[];
    activeApps?: ActiveApp[];
    pdsProvider?: PdsProviderInfo | null;
    claimed: boolean;
  };
  badge?: string;
  isSpeaker: boolean;
  group: FilterGroup;
}

const FILTER_LABELS: Record<FilterGroup, string> = {
  presentation: 'Speakers',
  lightning: 'Lightning Talks',
  panel: 'Panelists',
  workshop: 'Workshop Leads',
  attendee: 'Attendees',
};

const PDS_CATEGORY_LABELS: Record<string, string> = {
  bluesky: 'Bluesky',
  blacksky: 'Blacksky',
  eurosky: 'Eurosky',
  northsky: 'Northsky',
  'selfhosted-social': 'Selfhosted.social',
  selfhosted: 'Self-hosted',
  unknown: 'Unknown',
};

const PDS_CATEGORY_ORDER = [
  'bluesky',
  'blacksky',
  'eurosky',
  'northsky',
  'selfhosted-social',
  'selfhosted',
  'unknown',
];

function getPdsCategory(entry: EventEntry): string {
  const provider = pdsProviderFromApi(entry.profile.pdsProvider, entry.profile.handle);
  if (provider) return provider.name;
  return entry.profile.pdsProvider?.name ?? 'unknown';
}

interface EventCardGridProps {
  entries: EventEntry[];
  speakerCount: number;
  attendeeCount: number;
}

type SortOption = 'random' | 'followers';

export function EventCardGrid({ entries, speakerCount, attendeeCount }: EventCardGridProps) {
  const [activeFilters, setActiveFilters] = useState<Set<FilterGroup>>(new Set());
  const [activePdsFilters, setActivePdsFilters] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('random');

  const groupCounts = new Map<FilterGroup, number>();
  for (const entry of entries) {
    groupCounts.set(entry.group, (groupCounts.get(entry.group) ?? 0) + 1);
  }

  const pdsCategoryCounts = new Map<string, number>();
  for (const entry of entries) {
    const cat = getPdsCategory(entry);
    pdsCategoryCounts.set(cat, (pdsCategoryCounts.get(cat) ?? 0) + 1);
  }

  const availableGroups = (
    ['presentation', 'lightning', 'panel', 'workshop', 'attendee'] as FilterGroup[]
  ).filter((g) => (groupCounts.get(g) ?? 0) > 0);

  const availablePdsCategories = PDS_CATEGORY_ORDER.filter(
    (cat) => (pdsCategoryCounts.get(cat) ?? 0) > 0,
  );

  const toggleFilter = (group: FilterGroup) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const togglePdsFilter = (category: string) => {
    setActivePdsFilters((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // entries are pre-shuffled by the server; followers sort overrides that order
  const base = entries;
  const filtered = base.filter((e) => {
    if (activeFilters.size > 0 && !activeFilters.has(e.group)) return false;
    if (activePdsFilters.size > 0 && !activePdsFilters.has(getPdsCategory(e))) return false;
    return true;
  });

  const sorted =
    sortBy === 'followers'
      ? [...filtered].sort((a, b) => {
          const aCount =
            resolveDisplayFollowers(a.profile.atprotoFollowersCount, a.profile.followersCount)
              ?.count ?? 0;
          const bCount =
            resolveDisplayFollowers(b.profile.atprotoFollowersCount, b.profile.followersCount)
              ?.count ?? 0;
          return bCount - aCount;
        })
      : filtered;

  return (
    <>
      {/* Stats */}
      <div className="mb-4 flex justify-center gap-6 text-sm text-muted-foreground">
        <span>
          <strong className="text-foreground">{speakerCount}</strong> speakers
        </span>
        <span>
          <strong className="text-foreground">{attendeeCount}</strong>{' '}
          <abbr title="RSVPs via Smoke Signal" className="no-underline">
            RSVPed attendees
          </abbr>
        </span>
        <span>
          <strong className="text-foreground">{entries.length}</strong> total
        </span>
      </div>

      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {availableGroups.map((group) => {
          const isActive = activeFilters.has(group);
          return (
            <button
              key={group}
              type="button"
              onClick={() => toggleFilter(group)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
            >
              <Badge
                variant={isActive ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-1 text-xs"
              >
                {FILTER_LABELS[group]} ({groupCounts.get(group)})
              </Badge>
            </button>
          );
        })}
        {activeFilters.size > 0 && (
          <button
            type="button"
            onClick={() => setActiveFilters(new Set())}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Clear
          </button>
        )}
      </div>

      {/* PDS host filter bar */}
      {availablePdsCategories.length > 1 && (
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          <span className="flex items-center text-xs text-muted-foreground">PDS:</span>
          {availablePdsCategories.map((cat) => {
            const isActive = activePdsFilters.has(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => togglePdsFilter(cat)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
              >
                <Badge
                  variant={isActive ? 'default' : 'outline'}
                  className="cursor-pointer px-3 py-1 text-xs"
                >
                  <span className="inline-flex items-center gap-1">
                    <PdsIcon provider={cat} className="h-3 w-3 shrink-0" />
                    {PDS_CATEGORY_LABELS[cat] ?? cat} ({pdsCategoryCounts.get(cat)})
                  </span>
                </Badge>
              </button>
            );
          })}
          {activePdsFilters.size > 0 && (
            <button
              type="button"
              onClick={() => setActivePdsFilters(new Set())}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Sort + showing count */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          Sort:
          <button
            type="button"
            onClick={() => setSortBy('random')}
            className={`underline-offset-4 ${sortBy === 'random' ? 'font-medium text-foreground' : 'hover:text-foreground hover:underline'}`}
          >
            Random
          </button>
          <span aria-hidden="true">|</span>
          <button
            type="button"
            onClick={() => setSortBy('followers')}
            className={`underline-offset-4 ${sortBy === 'followers' ? 'font-medium text-foreground' : 'hover:text-foreground hover:underline'}`}
          >
            Followers
          </button>
        </span>
        {(activeFilters.size > 0 || activePdsFilters.size > 0) && (
          <span>
            Showing {filtered.length} of {entries.length}
          </span>
        )}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sorted.map(({ profile, badge }) => {
          const location: LocationValue | null = profile.locationCountry
            ? {
                country: profile.locationCountry,
                countryCode: profile.countryCode ?? undefined,
                region: profile.locationRegion ?? undefined,
                city: profile.locationCity ?? undefined,
              }
            : null;

          const currentPosition = (profile.positions as ProfilePosition[] | undefined)?.find(
            (p: ProfilePosition) => p.current,
          );

          return (
            <Link
              key={profile.handle}
              href={`/p/${profile.handle}`}
              className="h-full transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <IdentityCard
                className="h-full"
                did={profile.did}
                handle={profile.handle}
                displayName={profile.displayName}
                avatar={profile.avatar}
                pronouns={profile.pronouns}
                headline={profile.headline}
                about={profile.about}
                currentRole={currentPosition?.title}
                currentCompany={currentPosition?.companyName}
                location={location}
                website={profile.website}
                openTo={profile.openTo}
                followersCount={profile.followersCount}
                atprotoFollowersCount={profile.atprotoFollowersCount}
                trustStats={profile.trustStats}
                verifiedAccounts={profile.verifiedAccounts}
                activeApps={profile.activeApps}
                pdsProviderInfo={profile.pdsProvider}
                claimed={profile.claimed}
                variant="embed"
                badge={badge}
                hideFooter
              />
            </Link>
          );
        })}
      </div>
    </>
  );
}
