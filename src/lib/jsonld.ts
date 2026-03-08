export function buildPersonJsonLd(profile: any) {
  const currentPosition = profile.positions?.find((p: any) => p.current);

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
      alumniOf: profile.education.map((e: any) => ({
        '@type': 'EducationalOrganization',
        name: e.institution,
      })),
    }),
    ...(profile.skills?.length && {
      knowsAbout: profile.skills.map((s: any) => s.skillName),
    }),
  };
}
