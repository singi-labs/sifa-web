import { fetchProfile } from '@/lib/api';
import { notFound } from 'next/navigation';
import { buildPersonJsonLd, buildMetaDescription } from '@/lib/jsonld';
import { sanitize } from '@/lib/sanitize';
import { IdentityCard } from '@/components/identity-card';
import { DataTransparencyCard } from '@/components/data-transparency-card';
import { ProfileBody } from '@/components/profile-body';
import { UnclaimedBanner } from '@/components/unclaimed-banner';

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
      type: 'profile',
      ...(profile.avatar && {
        images: [{ url: profile.avatar, width: 400, height: 400, alt: `${title}'s profile photo` }],
      }),
    },
    twitter: {
      card: 'summary',
      title: `${title} | Sifa`,
      description,
      ...(profile.avatar && { images: [profile.avatar] }),
    },
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const profile = await fetchProfile(handle);
  if (!profile) notFound();

  return (
    <>
      {!profile.claimed && <UnclaimedBanner />}
      <div className="mx-auto max-w-4xl px-4 py-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildPersonJsonLd(profile, sanitize)),
          }}
        />
        <IdentityCard
          did={profile.did}
          handle={profile.handle}
          displayName={profile.displayName}
          avatar={profile.avatar}
          headline={profile.headline}
          about={profile.about}
          location={profile.location}
          website={profile.website}
          openTo={profile.openTo}
          trustStats={profile.trustStats}
          verifiedAccounts={profile.verifiedAccounts}
          claimed={profile.claimed}
          isOwnProfile={profile.isOwnProfile}
          isFollowing={profile.isFollowing}
        />
        {profile.isOwnProfile && <DataTransparencyCard did={profile.did} />}
        <ProfileBody profile={profile} />
      </div>
    </>
  );
}
