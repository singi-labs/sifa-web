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

type Sanitizer = (input: string) => string;

const identity: Sanitizer = (input: string) => input;

export function buildPersonJsonLd(profile: ProfileData, sanitizer: Sanitizer = identity) {
  const s = sanitizer;
  const currentPosition = profile.positions?.find((p) => p.current);

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: s(profile.displayName ?? profile.handle),
    jobTitle: profile.headline ? s(profile.headline) : undefined,
    description: profile.about ? s(profile.about) : undefined,
    url: `https://sifa.id/profile/${profile.handle}`,
    ...(currentPosition?.companyName && {
      worksFor: {
        '@type': 'Organization',
        name: s(currentPosition.companyName),
      },
    }),
    ...(profile.education?.length && {
      alumniOf: profile.education.map((e) => ({
        '@type': 'EducationalOrganization',
        name: e.institution ? s(e.institution) : undefined,
      })),
    }),
    ...(profile.skills?.length && {
      knowsAbout: profile.skills.map((sk) => (sk.skillName ? s(sk.skillName) : undefined)),
    }),
  };
}
