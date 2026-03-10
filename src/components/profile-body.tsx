'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { SectionNav } from '@/components/section-nav';
import { CompletionBar } from '@/components/completion-bar';
import { AboutSection } from '@/components/about-section';
import { ActivityOverview } from '@/components/activity-overview';
import { TrackRecord } from '@/components/track-record';
import { TrustStatsHints } from '@/components/trust-stats-hints';
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
} from '@/components/profile-sections';
import type { Profile } from '@/lib/types';

interface ProfileBodyProps {
  profile: Profile;
}

export function ProfileBody({ profile }: ProfileBodyProps) {
  const t = useTranslations('sections');
  const tProfile = useTranslations('profile');

  const populatedSections = useMemo(() => {
    const sections: { id: string; label: string }[] = [];

    if (profile.about) sections.push({ id: 'about', label: tProfile('about') });
    if (profile.positions.length > 0) sections.push({ id: 'career', label: t('career') });
    if (profile.education.length > 0) sections.push({ id: 'education', label: t('education') });
    if (profile.skills.length > 0) sections.push({ id: 'skills', label: t('skills') });
    if (profile.projects?.length) sections.push({ id: 'projects', label: t('projects') });
    if (profile.certifications?.length)
      sections.push({ id: 'credentials', label: t('credentials') });
    if (profile.publications?.length)
      sections.push({ id: 'publications', label: t('publications') });
    if (profile.volunteering?.length)
      sections.push({ id: 'volunteering', label: t('volunteering') });
    if (profile.honors?.length) sections.push({ id: 'awards', label: t('awards') });
    if (profile.languages?.length) sections.push({ id: 'languages', label: t('languages') });

    return sections;
  }, [profile, t, tProfile]);

  const content = (
    <div className="min-w-0 flex-1">
      <CompletionBar profile={profile} />
      <TrustStatsHints trustStats={profile.trustStats} isOwnProfile={profile.isOwnProfile} />

      {profile.about ? (
        <div id="about" className="scroll-mt-20">
          <AboutSection about={profile.about} isOwnProfile={profile.isOwnProfile} />
        </div>
      ) : (
        profile.isOwnProfile && <AboutSection about="" isOwnProfile />
      )}

      <ActivityOverview handle={profile.handle} />
      <TrackRecord isOwnProfile={profile.isOwnProfile} />

      <div id="career" className="scroll-mt-20">
        <CareerSection positions={profile.positions} />
      </div>
      <div id="education" className="scroll-mt-20">
        <EducationSection education={profile.education} courses={profile.courses} />
      </div>
      <div id="skills" className="scroll-mt-20">
        <SkillsSection skills={profile.skills} />
      </div>
      <div id="projects" className="scroll-mt-20">
        <ProjectsSection projects={profile.projects ?? []} />
      </div>
      <div id="credentials" className="scroll-mt-20">
        <CredentialsSection certifications={profile.certifications ?? []} />
      </div>
      <div id="publications" className="scroll-mt-20">
        <PublicationsSection publications={profile.publications ?? []} />
      </div>
      <div id="volunteering" className="scroll-mt-20">
        <VolunteeringSection volunteering={profile.volunteering ?? []} />
      </div>
      <div id="awards" className="scroll-mt-20">
        <AwardsSection honors={profile.honors ?? []} />
      </div>
      <div id="languages" className="scroll-mt-20">
        <LanguagesSection languages={profile.languages ?? []} />
      </div>
    </div>
  );

  return (
    <div className="relative mt-6 lg:flex lg:gap-8">
      <SectionNav sections={populatedSections} />
      {content}
    </div>
  );
}
