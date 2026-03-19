import { fetchProfile } from '@/lib/api';
import { notFound } from 'next/navigation';
import { buildPersonJsonLd, buildMetaDescription } from '@/lib/jsonld';
import { sanitize } from '@/lib/sanitize';
import { IdentityCard } from '@/components/identity-card';
import type { LocationValue, ProfilePosition } from '@/lib/types';
import { DataTransparencyCard } from '@/components/data-transparency-card';
import { ProfileEditProvider } from '@/components/profile-edit-provider';
import { ProfileBody } from '@/components/profile-body';
import { UnclaimedBanner } from '@/components/unclaimed-banner';
import { DeletedAccountModal } from '@/components/deleted-account-modal';

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const profile = await fetchProfile(handle);
  if (!profile) return { title: 'Profile Not Found' };

  const description = buildMetaDescription(profile);
  const title = profile.displayName
    ? `${profile.displayName} (@${profile.handle})`
    : profile.handle;
  const canonicalUrl = `https://sifa.id/p/${profile.handle}`;

  const oembedUrl = `https://sifa.id/api/oembed?url=${encodeURIComponent(canonicalUrl)}&format=json`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      types: {
        'application/json+oembed': oembedUrl,
      },
    },
    openGraph: {
      title: `${title} | Sifa`,
      description,
      url: canonicalUrl,
      siteName: 'Sifa',
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Sifa`,
      description,
    },
  };
}

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ deleted?: string }>;
}) {
  const { handle } = await params;
  const { deleted } = await searchParams;
  const profile = await fetchProfile(handle);
  if (!profile) notFound();

  // Assemble structured location from API's separate fields
  const location: LocationValue | null = profile.locationCountry
    ? {
        country: profile.locationCountry,
        countryCode: profile.countryCode ?? undefined,
        region: profile.locationRegion ?? undefined,
        city: profile.locationCity ?? undefined,
      }
    : null;

  // Replace the API's string location with structured LocationValue for downstream components
  profile.location = location;

  const currentPosition = (profile.positions as ProfilePosition[] | undefined)?.find(
    (p) => p.current,
  );

  return (
    <>
      {deleted === '1' && <DeletedAccountModal />}
      {!profile.claimed && <UnclaimedBanner />}
      <div className="mx-auto max-w-4xl px-4 py-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildPersonJsonLd(profile, sanitize)),
          }}
        />
        <ProfileEditProvider initialProfile={profile}>
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
            preferredWorkplace={profile.preferredWorkplace}
            followersCount={profile.followersCount}
            atprotoFollowersCount={profile.atprotoFollowersCount}
            trustStats={profile.trustStats}
            verifiedAccounts={profile.verifiedAccounts}
            pdsProviderInfo={profile.pdsProvider}
            claimed={profile.claimed}
            isOwnProfile={profile.isOwnProfile}
            isFollowing={profile.isFollowing}
          />
          {profile.isOwnProfile && <DataTransparencyCard did={profile.did} />}
          <ProfileBody />
        </ProfileEditProvider>
      </div>
    </>
  );
}
