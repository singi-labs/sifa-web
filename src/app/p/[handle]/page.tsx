import { fetchProfile } from '@/lib/api';
import { notFound } from 'next/navigation';
import { buildPersonJsonLd, buildMetaDescription } from '@/lib/jsonld';
import { sanitize } from '@/lib/sanitize';
import { IdentityCard } from '@/components/identity-card';
import { ProfileBody } from '@/components/profile-body';

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const profile = await fetchProfile(handle);
  if (!profile) return { title: 'Profile Not Found' };

  const description = buildMetaDescription(profile);
  const title = profile.displayName
    ? `${profile.displayName} (@${profile.handle})`
    : profile.handle;
  const canonicalUrl = `https://sifa.id/p/${profile.handle}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
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
    <main className="mx-auto max-w-4xl px-4 py-8">
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
        location={profile.location}
        website={profile.website}
        openTo={profile.openTo}
        trustStats={profile.trustStats}
        verifiedAccounts={profile.verifiedAccounts}
        isOwnProfile={profile.isOwnProfile}
        isFollowing={profile.isFollowing}
      />
      <ProfileBody profile={profile} />
    </main>
  );
}
