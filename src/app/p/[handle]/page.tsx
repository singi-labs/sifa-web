import { fetchProfile } from '@/lib/api';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { buildPersonJsonLd } from '@/lib/jsonld';
import { sanitize } from '@/lib/sanitize';
import { ProfileHeader } from './components/profile-header';
import { ExperienceSection } from './components/experience-section';
import { EducationSection } from './components/education-section';
import { SkillsSection } from './components/skills-section';
import { FollowButton } from '@/components/follow-button';

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

  const t = await getTranslations('profile');

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildPersonJsonLd(profile, sanitize)),
        }}
      />
      <ProfileHeader profile={profile} />
      {profile.did && !profile.isOwnProfile && (
        <div className="mt-4">
          <FollowButton targetDid={profile.did} isFollowing={profile.isFollowing ?? false} />
        </div>
      )}
      {profile.about && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold">{t('about')}</h2>
          <p className="mt-2 text-muted-foreground">{sanitize(profile.about)}</p>
        </section>
      )}
      <ExperienceSection positions={profile.positions} />
      <EducationSection education={profile.education} />
      <SkillsSection skills={profile.skills} />
    </main>
  );
}
