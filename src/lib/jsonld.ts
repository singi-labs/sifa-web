import type { LocationValue } from '@/lib/types';
import { formatLocation } from '@/lib/location-utils';

interface ProfilePosition {
  current?: boolean;
  companyName?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface ProfileEducation {
  institution?: string;
  degree?: string;
  fieldOfStudy?: string;
}

interface ProfileSkill {
  skillName?: string;
}

interface ProfileCertification {
  name?: string;
  issuingOrg?: string;
  credentialUrl?: string;
}

interface ProfileVolunteering {
  organization?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
}

interface ProfileHonor {
  title?: string;
}

interface ProfileLanguage {
  language?: string;
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
  location?: LocationValue | null;
  website?: string;
  positions?: ProfilePosition[];
  education?: ProfileEducation[];
  skills?: ProfileSkill[];
  certifications?: ProfileCertification[];
  volunteering?: ProfileVolunteering[];
  honors?: ProfileHonor[];
  languages?: ProfileLanguage[];
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

  const hasCredential = [
    ...(profile.education ?? [])
      .filter((e) => e.degree)
      .map((e) => ({
        '@type': 'EducationalOccupationalCredential' as const,
        credentialCategory: 'degree' as const,
        name: [e.degree, e.fieldOfStudy].filter(Boolean).join(' '),
        ...(e.institution && {
          recognizedBy: {
            '@type': 'EducationalOrganization' as const,
            name: s(e.institution),
          },
        }),
      })),
    ...(profile.certifications ?? [])
      .filter((c) => c.name)
      .map((c) => ({
        '@type': 'EducationalOccupationalCredential' as const,
        name: s(c.name!),
        ...(c.issuingOrg && {
          recognizedBy: {
            '@type': 'Organization' as const,
            name: s(c.issuingOrg),
          },
        }),
        ...(c.credentialUrl && { url: c.credentialUrl }),
      })),
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: s(profile.displayName ?? profile.handle),
    jobTitle: profile.headline
      ? s(profile.headline)
      : currentPosition?.title
        ? s(currentPosition.title)
        : undefined,
    description: profile.about ? s(profile.about) : undefined,
    url: `https://sifa.id/p/${profile.handle}`,
    image: profile.avatar ?? undefined,
    ...(profile.location && {
      homeLocation: {
        '@type': 'Place',
        name: s(formatLocation(profile.location)),
        ...(profile.location.countryCode && {
          address: {
            '@type': 'PostalAddress',
            addressCountry: profile.location.countryCode,
          },
        }),
      },
    }),
    ...(profile.positions?.length && {
      worksFor: profile.positions
        .filter((p) => p.companyName)
        .map((p) => ({
          '@type': 'Organization' as const,
          name: s(p.companyName!),
          ...(p.title && {
            member: {
              '@type': 'OrganizationRole' as const,
              roleName: s(p.title),
              ...(p.startDate && { startDate: p.startDate }),
              ...(p.endDate && { endDate: p.endDate }),
            },
          }),
        })),
    }),
    ...(profile.education?.length && {
      alumniOf: profile.education
        .filter((e) => e.institution)
        .map((e) => ({
          '@type': 'EducationalOrganization' as const,
          name: s(e.institution!),
        })),
    }),
    ...(hasCredential.length > 0 && { hasCredential }),
    ...(profile.volunteering?.length && {
      memberOf: profile.volunteering
        .filter((v) => v.organization)
        .map((v) => ({
          '@type': 'OrganizationRole' as const,
          memberOf: {
            '@type': 'Organization' as const,
            name: s(v.organization!),
          },
          ...(v.role && { roleName: s(v.role) }),
          ...(v.startDate && { startDate: v.startDate }),
          ...(v.endDate && { endDate: v.endDate }),
        })),
    }),
    ...(() => {
      const awards = (profile.honors ?? []).filter((h) => h.title).map((h) => s(h.title!));
      return awards.length > 0 ? { award: awards } : {};
    })(),
    ...(profile.languages?.length && {
      knowsLanguage: profile.languages.filter((l) => l.language).map((l) => l.language!),
    }),
    ...(profile.skills?.length && {
      knowsAbout: profile.skills.map((sk) => (sk.skillName ? s(sk.skillName) : undefined)),
    }),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

export function buildProfilePageJsonLd(profile: ProfileData, sanitizer: Sanitizer = identity) {
  const person = buildPersonJsonLd(profile, sanitizer);
  const { '@context': _, ...personWithoutContext } = person;

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage' as const,
    url: `https://sifa.id/p/${profile.handle}`,
    mainEntity: personWithoutContext,
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
    parts.push(formatLocation(profile.location));
  }

  if (parts.length === 0) {
    return `${profile.displayName ?? profile.handle} on Sifa`;
  }

  return parts.join(' · ');
}
