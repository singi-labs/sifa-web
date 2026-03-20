import { notFound } from 'next/navigation';
import { fetchProfile } from '@/lib/api';
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
  if (!profile) notFound();

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
    </div>
  );
}
