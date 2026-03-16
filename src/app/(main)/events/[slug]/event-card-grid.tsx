'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IdentityCard } from '@/components/identity-card';
import { Badge } from '@/components/ui/badge';
import type {
  ActiveApp,
  LocationValue,
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
    trustStats?: TrustStat[];
    verifiedAccounts?: VerifiedAccount[];
    activeApps?: ActiveApp[];
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

interface EventCardGridProps {
  entries: EventEntry[];
  speakerCount: number;
  attendeeCount: number;
}

export function EventCardGrid({ entries, speakerCount, attendeeCount }: EventCardGridProps) {
  const [activeFilters, setActiveFilters] = useState<Set<FilterGroup>>(new Set());

  const groupCounts = new Map<FilterGroup, number>();
  for (const entry of entries) {
    groupCounts.set(entry.group, (groupCounts.get(entry.group) ?? 0) + 1);
  }

  const availableGroups = (
    ['presentation', 'lightning', 'panel', 'workshop', 'attendee'] as FilterGroup[]
  ).filter((g) => (groupCounts.get(g) ?? 0) > 0);

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

  const filtered =
    activeFilters.size === 0 ? entries : entries.filter((e) => activeFilters.has(e.group));

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
            attendees
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
            Clear filters
          </button>
        )}
      </div>

      {/* Showing count when filtered */}
      {activeFilters.size > 0 && (
        <p className="mb-4 text-center text-sm text-muted-foreground">
          Showing {filtered.length} of {entries.length}
        </p>
      )}

      {/* Card grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(({ profile, badge }) => {
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
              className="transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <IdentityCard
                did={profile.did}
                handle={profile.handle}
                displayName={profile.displayName}
                avatar={profile.avatar}
                headline={profile.headline}
                about={profile.about}
                currentRole={currentPosition?.title}
                currentCompany={currentPosition?.companyName}
                location={location}
                website={profile.website}
                openTo={profile.openTo}
                followersCount={profile.followersCount}
                trustStats={profile.trustStats}
                verifiedAccounts={profile.verifiedAccounts}
                activeApps={profile.activeApps}
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
