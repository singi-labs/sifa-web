import { fetchProfile } from '@/lib/api';
import { notFound } from 'next/navigation';
import { buildPersonJsonLd } from '@/lib/jsonld';
import { sanitize } from '@/lib/sanitize';
import { IdentityCard } from '@/components/identity-card';
import { ProfileBody } from '@/components/profile-body';

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const profile = await fetchProfile(handle);
  if (!profile) return { title: 'Profile Not Found' };

  return {
    title: `${profile.handle} - Sifa`,
    description: profile.headline ?? `${profile.handle} on Sifa`,
    openGraph: {
      title: `${profile.handle} - Sifa`,
      description: profile.headline ?? '',
      url: `https://sifa.id/p/${profile.handle}`,
      type: 'profile',
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
