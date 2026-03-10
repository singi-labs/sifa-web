interface ProfilePosition {
  current?: boolean;
  companyName?: string;
  title?: string;
}

interface ProfileEducation {
  institution?: string;
}

interface ProfileSkill {
  skillName?: string;
}

interface VerifiedAccount {
  platform: string;
  identifier: string;
  url?: string;
}

interface ProfileData {
  handle: string;
  displayName?: string;
  headline?: string;
  about?: string;
  avatar?: string;
  location?: string;
  website?: string;
  positions?: ProfilePosition[];
  education?: ProfileEducation[];
  skills?: ProfileSkill[];
  verifiedAccounts?: VerifiedAccount[];
}

type Sanitizer = (input: string) => string;

const identity: Sanitizer = (input: string) => input;

export function buildPersonJsonLd(profile: ProfileData, sanitizer: Sanitizer = identity) {
  const s = sanitizer;
  const currentPosition = profile.positions?.find((p) => p.current);

  // Collect sameAs URLs from verified accounts and website
  const sameAs: string[] = [];
  if (profile.website) {
    const url = profile.website.startsWith('http') ? profile.website : `https://${profile.website}`;
    sameAs.push(url);
  }
  if (profile.verifiedAccounts) {
    for (const account of profile.verifiedAccounts) {
      if (account.url) sameAs.push(account.url);
    }
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: s(profile.displayName ?? profile.handle),
    jobTitle: profile.headline ? s(profile.headline) : undefined,
    description: profile.about ? s(profile.about) : undefined,
    url: `https://sifa.id/p/${profile.handle}`,
    image: profile.avatar ?? undefined,
    ...(profile.location && { homeLocation: { '@type': 'Place', name: s(profile.location) } }),
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
    ...(sameAs.length > 0 && { sameAs }),
  };
}

/**
 * Generate a meta description from profile data.
 * Falls back gracefully when data is incomplete.
 */
export function buildMetaDescription(profile: ProfileData): string {
  const parts: string[] = [];

  if (profile.headline) {
    parts.push(profile.headline);
  }

  const currentPosition = profile.positions?.find((p) => p.current);
  if (currentPosition) {
    const positionParts: string[] = [];
    if (currentPosition.title) positionParts.push(currentPosition.title);
    if (currentPosition.companyName) positionParts.push(`at ${currentPosition.companyName}`);
    if (positionParts.length > 0) parts.push(positionParts.join(' '));
  }

  if (profile.location) {
    parts.push(profile.location);
  }

  if (parts.length === 0) {
    return `${profile.displayName ?? profile.handle} on Sifa`;
  }

  return parts.join(' · ');
}
