'use client';

import Link from 'next/link';
import { IdentityCard } from '@/components/identity-card';
import type { ConnectionMap } from '@/hooks/use-attendee-connections';
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
    pronouns?: string;
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

interface EventCardGridProps {
  entries: EventEntry[];
  connections?: ConnectionMap;
}

export function EventCardGrid({ entries, connections }: EventCardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {entries.map(({ profile, badge }) => {
        const connectionType = connections?.get(profile.did);
        const location: LocationValue | null = profile.locationCountry
          ? {
              country: profile.locationCountry,
              countryCode: profile.countryCode ?? undefined,
              region: profile.locationRegion ?? undefined,
              city: profile.locationCity ?? undefined,
            }
          : null;

        const currentPosition = (profile.positions as ProfilePosition[] | undefined)?.find(
          (p: ProfilePosition) => !p.endedAt,
        );

        return (
          <Link
            key={profile.handle}
            href={`/p/${profile.handle}`}
            aria-label={`View profile of ${profile.displayName ?? profile.handle}`}
            className="relative h-full transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
              currentCompany={currentPosition?.company}
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
              connectionType={connectionType}
              hideFooter
            />
          </Link>
        );
      })}
    </div>
  );
}
