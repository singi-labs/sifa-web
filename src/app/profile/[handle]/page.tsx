import { fetchProfile } from '@/lib/api';
import { notFound } from 'next/navigation';
import { ProfileHeader } from './components/profile-header';
import { ExperienceSection } from './components/experience-section';
import { EducationSection } from './components/education-section';
import { SkillsSection } from './components/skills-section';

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
      url: `https://sifa.id/profile/${profile.handle}`,
      type: 'profile',
    },
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const profile = await fetchProfile(handle);
  if (!profile) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <ProfileHeader profile={profile} />
      {profile.about && (
        <section className="mt-6">
          <p className="text-muted-foreground">{profile.about}</p>
        </section>
      )}
      <ExperienceSection positions={profile.positions} />
      <EducationSection education={profile.education} />
      <SkillsSection skills={profile.skills} />
    </main>
  );
}
