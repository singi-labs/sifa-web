interface ProfilePosition {
  current?: boolean;
  companyName?: string;
}

interface ProfileEducation {
  institution?: string;
}

interface ProfileSkill {
  skillName?: string;
}

interface ProfileData {
  handle: string;
  displayName?: string;
  headline?: string;
  about?: string;
  positions?: ProfilePosition[];
  education?: ProfileEducation[];
  skills?: ProfileSkill[];
}

export function buildPersonJsonLd(profile: ProfileData) {
  const currentPosition = profile.positions?.find((p) => p.current);

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.displayName ?? profile.handle,
    jobTitle: profile.headline,
    description: profile.about,
    url: `https://sifa.id/profile/${profile.handle}`,
    ...(currentPosition && {
      worksFor: {
        '@type': 'Organization',
        name: currentPosition.companyName,
      },
    }),
    ...(profile.education?.length && {
      alumniOf: profile.education.map((e) => ({
        '@type': 'EducationalOrganization',
        name: e.institution,
      })),
    }),
    ...(profile.skills?.length && {
      knowsAbout: profile.skills.map((s) => s.skillName),
    }),
  };
}
