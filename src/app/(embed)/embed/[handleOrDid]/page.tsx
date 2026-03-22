import { fetchProfile } from '@/lib/api';
import { ActivityIndicators } from '@/components/activity-indicators';
import { IdentityCard } from '@/components/identity-card';
import { EmbedResizeEmitter } from '@/components/embed-resize-emitter';
import type { LocationValue, ProfilePosition } from '@/lib/types';

export const revalidate = 3600; // 1 hour ISR

export async function generateMetadata() {
  return {
    robots: 'noindex, nofollow',
  };
}

interface EmbedPageProps {
  params: Promise<{ handleOrDid: string }>;
}

export default async function EmbedPage({ params }: EmbedPageProps) {
  const { handleOrDid } = await params;

  const profile = await fetchProfile(handleOrDid);
  if (!profile) {
    return (
      <div className="bg-transparent p-2">
        <EmbedResizeEmitter />
        <div className="flex items-center justify-center rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          <p>
            No profile found for <span className="font-medium text-foreground">{handleOrDid}</span>
          </p>
        </div>
      </div>
    );
  }

  const location: LocationValue | null = profile.locationCountry
    ? {
        country: profile.locationCountry,
        countryCode: profile.countryCode ?? undefined,
        region: profile.locationRegion ?? undefined,
        city: profile.locationCity ?? undefined,
      }
    : null;

  const currentPosition = (profile.positions as ProfilePosition[] | undefined)?.find(
    (p) => p.current,
  );

  return (
    <div className="bg-transparent p-2">
      <EmbedResizeEmitter />
      <IdentityCard
        variant="embed"
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
      />
      {profile.activeApps && profile.activeApps.length > 0 && (
        <div className="px-6 pb-2">
          <ActivityIndicators apps={profile.activeApps} maxVisible={2} />
        </div>
      )}
    </div>
  );
}
