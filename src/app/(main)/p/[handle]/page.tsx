import { fetchProfile } from '@/lib/api';
import { notFound, permanentRedirect } from 'next/navigation';
import { buildProfilePageJsonLd, buildMetaDescription } from '@/lib/jsonld';
import { sanitize } from '@/lib/sanitize';
import { IdentityCard } from '@/components/identity-card';
import type { LocationValue, ProfilePosition } from '@/lib/types';
import { DataTransparencyCard } from '@/components/data-transparency-card';
import { ProfileEditProvider } from '@/components/profile-edit-provider';
import { ProfileBody } from '@/components/profile-body';
import { UnclaimedBanner } from '@/components/unclaimed-banner';
import { DeletedAccountModal } from '@/components/deleted-account-modal';
import { ConnectModal } from '@/components/connect-modal';
import { ProfileNote } from '@/components/profile-note';

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
      title: `${title} | Sifa ID`,
      description,
      url: canonicalUrl,
      siteName: 'Sifa ID',
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Sifa ID`,
      description,
    },
  };
}

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ deleted?: string; connect?: string }>;
}) {
  const { handle } = await params;
  const { deleted, connect } = await searchParams;
  const profile = await fetchProfile(handle);
  if (!profile) notFound();

  // Redirect DID-based URLs to the canonical handle-based URL
  if (handle.startsWith('did:') && profile.handle && !profile.handle.startsWith('did:')) {
    permanentRedirect(`/p/${profile.handle}`);
  }

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

  // Map API's skillRkeys to linkedSkills + skills on each position
  // The API returns skillRkeys: string[] but the frontend expects linkedSkills: ProfileSkill[]
  // and skills: SkillRef[] for the edit dialog to pre-populate correctly.
  const skillsByRkey = new Map((profile.skills ?? []).map((s: { rkey: string }) => [s.rkey, s]));
  for (const pos of profile.positions ?? []) {
    const rkeys: string[] = ((pos as Record<string, unknown>).skillRkeys as string[]) ?? [];
    pos.linkedSkills = rkeys
      .map((rk: string) => skillsByRkey.get(rk))
      .filter(Boolean) as typeof profile.skills;
    pos.skills = rkeys.map((rk: string) => ({
      uri: `at://${profile.did}/id.sifa.profile.skill/${rk}`,
      cid: '',
    }));
  }

  const currentPositions =
    (profile.positions as ProfilePosition[] | undefined)?.filter((p) => !p.endedAt) ?? [];
  const currentPosition =
    currentPositions.find((p) => p.primary) ??
    currentPositions.sort((a, b) => (b.startedAt ?? '').localeCompare(a.startedAt ?? ''))[0] ??
    null;

  const featuredSkills = (profile.skills ?? [])
    .slice(0, 3)
    .map((s: { rkey: string; name: string }) => ({
      rkey: s.rkey,
      name: s.name,
    }));

  return (
    <>
      {deleted === '1' && <DeletedAccountModal />}
      {connect === '1' && (
        <ConnectModal
          did={profile.did}
          handle={profile.handle}
          displayName={profile.displayName}
          avatar={profile.avatar}
          headline={profile.headline}
          isOwnProfile={profile.isOwnProfile}
          isFollowing={profile.isFollowing}
        />
      )}
      {!profile.claimed && <UnclaimedBanner />}
      <div className="mx-auto max-w-4xl px-4 py-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildProfilePageJsonLd(profile, sanitize)),
          }}
        />
        <ProfileEditProvider initialProfile={profile}>
          <IdentityCard
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
            preferredWorkplace={profile.preferredWorkplace}
            followersCount={profile.followersCount}
            atprotoFollowersCount={profile.atprotoFollowersCount}
            trustStats={profile.trustStats}
            verifiedAccounts={profile.verifiedAccounts}
            pdsProviderInfo={profile.pdsProvider}
            claimed={profile.claimed}
            isOwnProfile={profile.isOwnProfile}
            isFollowing={profile.isFollowing}
            hasDisplayNameOverride={profile.hasDisplayNameOverride}
            hasAvatarUrlOverride={profile.hasAvatarUrlOverride}
            sourceDisplayName={profile.source?.displayName}
            sourceAvatar={profile.source?.avatarUrl}
            activeApps={profile.activeApps}
            featuredSkills={featuredSkills}
          />
          {!profile.isOwnProfile && <ProfileNote did={profile.did} />}
          {profile.isOwnProfile && <DataTransparencyCard did={profile.did} />}
          <ProfileBody />
        </ProfileEditProvider>
      </div>
    </>
  );
}
