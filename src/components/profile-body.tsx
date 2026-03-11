'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { SectionNav } from '@/components/section-nav';
import { CompletionBar } from '@/components/completion-bar';
import { AboutSection } from '@/components/about-section';
import { ActivityOverview } from '@/components/activity-overview';
import { TrackRecord } from '@/components/track-record';
import { TrustStatsHints } from '@/components/trust-stats-hints';
import { ProfileEditProvider, useProfileEdit } from '@/components/profile-edit-provider';
import {
  CareerSection,
  EducationSection,
  SkillsSection,
  ProjectsSection,
  CredentialsSection,
  PublicationsSection,
  VolunteeringSection,
  AwardsSection,
  LanguagesSection,
  ExternalAccountsSection,
} from '@/components/profile-sections';
import type { Profile } from '@/lib/types';

interface ProfileBodyProps {
  profile: Profile;
}

export function ProfileBody({ profile: initialProfile }: ProfileBodyProps) {
  return (
    <ProfileEditProvider initialProfile={initialProfile}>
      <ProfileBodyContent />
    </ProfileEditProvider>
  );
}

const ALL_SECTIONS = [
  { id: 'about', labelKey: 'about', ns: 'profile' as const },
  { id: 'career', labelKey: 'career', ns: 'sections' as const },
  { id: 'education', labelKey: 'education', ns: 'sections' as const },
  { id: 'skills', labelKey: 'skills', ns: 'sections' as const },
  { id: 'projects', labelKey: 'projects', ns: 'sections' as const },
  { id: 'credentials', labelKey: 'credentials', ns: 'sections' as const },
  { id: 'publications', labelKey: 'publications', ns: 'sections' as const },
  { id: 'volunteering', labelKey: 'volunteering', ns: 'sections' as const },
  { id: 'awards', labelKey: 'awards', ns: 'sections' as const },
  { id: 'languages', labelKey: 'languages', ns: 'sections' as const },
  { id: 'other-profiles', labelKey: 'otherProfiles', ns: 'sections' as const },
] as const;

function isSectionPopulated(profile: Profile, id: string): boolean {
  switch (id) {
    case 'about': return Boolean(profile.about);
    case 'career': return profile.positions.length > 0;
    case 'education': return profile.education.length > 0;
    case 'skills': return profile.skills.length > 0;
    case 'projects': return Boolean(profile.projects?.length);
    case 'credentials': return Boolean(profile.certifications?.length);
    case 'publications': return Boolean(profile.publications?.length);
    case 'volunteering': return Boolean(profile.volunteering?.length);
    case 'awards': return Boolean(profile.honors?.length);
    case 'languages': return Boolean(profile.languages?.length);
    case 'other-profiles': return Boolean(profile.externalAccounts?.length);
    default: return false;
  }
}

function ProfileBodyContent() {
  const { profile } = useProfileEdit();
  const t = useTranslations('sections');
  const tProfile = useTranslations('profile');
  const isOwn = profile.isOwnProfile;

  const navSections = useMemo(() => {
    const sections: { id: string; label: string }[] = [];
    for (const sec of ALL_SECTIONS) {
      if (isOwn || isSectionPopulated(profile, sec.id)) {
        const label = sec.ns === 'profile' ? tProfile(sec.labelKey) : t(sec.labelKey);
        sections.push({ id: sec.id, label });
      }
    }
    return sections;
  }, [profile, isOwn, t, tProfile]);

  const content = (
    <div className="min-w-0 flex-1">
      <CompletionBar profile={profile} />
      <TrustStatsHints trustStats={profile.trustStats} isOwnProfile={isOwn} />

      {profile.about ? (
        <div id="about" className="scroll-mt-20">
          <AboutSection about={profile.about} isOwnProfile={isOwn} />
        </div>
      ) : (
        isOwn && <AboutSection about="" isOwnProfile />
      )}

      <ActivityOverview handle={profile.handle} />
      <TrackRecord isOwnProfile={isOwn} />

      <div id="career" className="scroll-mt-20">
        <CareerSection positions={profile.positions} isOwnProfile={isOwn} />
      </div>
      <div id="education" className="scroll-mt-20">
        <EducationSection education={profile.education} courses={profile.courses} isOwnProfile={isOwn} />
      </div>
      <div id="skills" className="scroll-mt-20">
        <SkillsSection skills={profile.skills} isOwnProfile={isOwn} />
      </div>
      <div id="projects" className="scroll-mt-20">
        <ProjectsSection projects={profile.projects ?? []} isOwnProfile={isOwn} />
      </div>
      <div id="credentials" className="scroll-mt-20">
        <CredentialsSection certifications={profile.certifications ?? []} isOwnProfile={isOwn} />
      </div>
      <div id="publications" className="scroll-mt-20">
        <PublicationsSection publications={profile.publications ?? []} isOwnProfile={isOwn} />
      </div>
      <div id="volunteering" className="scroll-mt-20">
        <VolunteeringSection volunteering={profile.volunteering ?? []} isOwnProfile={isOwn} />
      </div>
      <div id="awards" className="scroll-mt-20">
        <AwardsSection honors={profile.honors ?? []} isOwnProfile={isOwn} />
      </div>
      <div id="languages" className="scroll-mt-20">
        <LanguagesSection languages={profile.languages ?? []} isOwnProfile={isOwn} />
      </div>
      <div id="other-profiles" className="scroll-mt-20">
        <ExternalAccountsSection accounts={profile.externalAccounts ?? []} isOwnProfile={isOwn} />
      </div>
    </div>
  );

  return (
    <div className="relative mt-6 lg:flex lg:gap-8">
      <SectionNav sections={navSections} />
      {content}
    </div>
  );
}
