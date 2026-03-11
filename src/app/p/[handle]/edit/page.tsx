import { fetchProfile } from '@/lib/api';
import { notFound } from 'next/navigation';
import { IdentityCard } from '@/components/identity-card';
import { ProfileBody } from '@/components/profile-body';

export const metadata = {
  title: 'Edit Profile',
};

export default async function EditProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const profile = await fetchProfile(handle);
  if (!profile) notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
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
        claimed={profile.claimed}
        isOwnProfile={profile.isOwnProfile}
        isFollowing={profile.isFollowing}
      />
      <ProfileBody profile={profile} />
    </main>
  );
}
