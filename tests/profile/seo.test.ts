import { describe, it, expect } from 'vitest';
import { buildPersonJsonLd, buildProfilePageJsonLd, buildMetaDescription } from '@/lib/jsonld';

describe('JSON-LD generation', () => {
  it('builds Schema.org Person from profile', () => {
    const ld = buildPersonJsonLd({
      handle: 'alice.bsky.social',
      headline: 'Senior Engineer',
      about: 'Building things',
      positions: [{ company: 'Acme' }],
      education: [{ institution: 'MIT' }],
      skills: [{ name: 'TypeScript' }],
    });

    expect(ld['@type']).toBe('Person');
    expect(ld.jobTitle).toBe('Senior Engineer');
    expect(ld.worksFor).toBeDefined();
    expect(ld.worksFor![0]!.name).toBe('Acme');
    expect(ld.knowsAbout).toContain('TypeScript');
  });

  it('handles profile without current position', () => {
    const ld = buildPersonJsonLd({
      handle: 'bob.bsky.social',
      positions: [],
      education: [],
      skills: [],
    });

    expect(ld['@type']).toBe('Person');
    expect(ld.worksFor).toBeUndefined();
    expect(ld.alumniOf).toBeUndefined();
    expect(ld.knowsAbout).toBeUndefined();
  });

  it('includes alumni info from education', () => {
    const ld = buildPersonJsonLd({
      handle: 'carol.bsky.social',
      positions: [],
      education: [{ institution: 'MIT' }, { institution: 'Stanford' }],
      skills: [],
    });

    expect(ld.alumniOf).toHaveLength(2);
    expect(ld.alumniOf![0]!['@type']).toBe('EducationalOrganization');
  });

  it('includes sameAs from verified accounts and website', () => {
    const ld = buildPersonJsonLd({
      handle: 'alice.bsky.social',
      website: 'https://alice.dev',
      verifiedAccounts: [
        { platform: 'github', identifier: 'alice', url: 'https://github.com/alice' },
      ],
    });

    expect(ld.sameAs).toBeDefined();
    expect(ld.sameAs).toContain('https://alice.dev');
    expect(ld.sameAs).toContain('https://github.com/alice');
  });

  it('includes avatar as image', () => {
    const ld = buildPersonJsonLd({
      handle: 'alice.bsky.social',
      avatar: 'https://cdn.example.com/alice.jpg',
    });

    expect(ld.image).toBe('https://cdn.example.com/alice.jpg');
  });

  it('includes homeLocation', () => {
    const ld = buildPersonJsonLd({
      handle: 'alice.bsky.social',
      location: { city: 'Amsterdam', country: 'Netherlands' },
    });

    expect(ld.homeLocation).toBeDefined();
    expect(ld.homeLocation!.name).toBe('Amsterdam, Netherlands');
  });

  // Task 1: Full position history
  it('includes full position history in worksFor', () => {
    const ld = buildPersonJsonLd({
      handle: 'alice.bsky.social',
      positions: [
        { company: 'Acme', title: 'CTO', startedAt: '2023-01' },
        {
          company: 'OldCorp',
          title: 'Engineer',
          startedAt: '2020-03',
          endedAt: '2022-12',
        },
      ],
      education: [],
      skills: [],
    });

    expect(ld.worksFor).toHaveLength(2);
    expect(ld.worksFor![0]).toMatchObject({
      '@type': 'Organization',
      name: 'Acme',
      member: {
        '@type': 'OrganizationRole',
        roleName: 'CTO',
        startDate: '2023-01',
      },
    });
    expect(ld.worksFor![1]).toMatchObject({
      '@type': 'Organization',
      name: 'OldCorp',
      member: {
        '@type': 'OrganizationRole',
        roleName: 'Engineer',
        startDate: '2020-03',
        endDate: '2022-12',
      },
    });
  });

  it('falls back to current position title for jobTitle when no headline', () => {
    const ld = buildPersonJsonLd({
      handle: 'alice.bsky.social',
      positions: [{ company: 'Acme', title: 'CTO' }],
    });

    expect(ld.jobTitle).toBe('CTO');
  });

  // Task 2: Education credentials
  it('includes degree and field in hasCredential', () => {
    const ld = buildPersonJsonLd({
      handle: 'alice.bsky.social',
      positions: [],
      education: [
        { institution: 'MIT', degree: 'MSc', fieldOfStudy: 'Computer Science' },
        { institution: 'Stanford' },
      ],
      skills: [],
    });

    expect(ld.alumniOf).toHaveLength(2);
    expect(ld.alumniOf![0]).toMatchObject({
      '@type': 'EducationalOrganization',
      name: 'MIT',
    });
    expect(ld.hasCredential).toBeDefined();
    expect(ld.hasCredential![0]).toMatchObject({
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'degree',
      name: 'MSc Computer Science',
      recognizedBy: { '@type': 'EducationalOrganization', name: 'MIT' },
    });
  });

  // Task 3: Certifications
  it('includes certifications in hasCredential', () => {
    const ld = buildPersonJsonLd({
      handle: 'alice.bsky.social',
      certifications: [
        {
          name: 'AWS Solutions Architect',
          issuingOrg: 'Amazon',
          credentialUrl: 'https://aws.amazon.com/cert/123',
        },
      ],
    });

    expect(ld.hasCredential).toBeDefined();
    expect(ld.hasCredential!).toContainEqual(
      expect.objectContaining({
        '@type': 'EducationalOccupationalCredential',
        name: 'AWS Solutions Architect',
        recognizedBy: { '@type': 'Organization', name: 'Amazon' },
        url: 'https://aws.amazon.com/cert/123',
      }),
    );
  });

  it('merges education and certification credentials', () => {
    const ld = buildPersonJsonLd({
      handle: 'alice.bsky.social',
      education: [{ institution: 'MIT', degree: 'MSc', fieldOfStudy: 'CS' }],
      certifications: [{ name: 'AWS SA', issuingOrg: 'Amazon' }],
    });

    expect(ld.hasCredential).toHaveLength(2);
  });

  // Task 4: Volunteering, honors, languages
  it('includes volunteering as memberOf', () => {
    const ld = buildPersonJsonLd({
      handle: 'alice.bsky.social',
      volunteering: [{ organization: 'Red Cross', role: 'Coordinator', startDate: '2022-01' }],
    });

    expect(ld.memberOf).toBeDefined();
    expect(ld.memberOf![0]).toMatchObject({
      '@type': 'OrganizationRole',
      memberOf: { '@type': 'Organization', name: 'Red Cross' },
      roleName: 'Coordinator',
      startDate: '2022-01',
    });
  });

  it('includes honors as award strings', () => {
    const ld = buildPersonJsonLd({
      handle: 'alice.bsky.social',
      honors: [{ title: 'Best Paper Award' }, { title: "Dean's List" }],
    });

    expect(ld.award).toEqual(['Best Paper Award', "Dean's List"]);
  });

  it('includes languages as knowsLanguage', () => {
    const ld = buildPersonJsonLd({
      handle: 'alice.bsky.social',
      languages: [{ language: 'English' }, { language: 'Dutch' }],
    });

    expect(ld.knowsLanguage).toBeDefined();
    expect(ld.knowsLanguage).toContain('English');
    expect(ld.knowsLanguage).toContain('Dutch');
  });
});

// Task 5: ProfilePage wrapper
describe('ProfilePage JSON-LD wrapper', () => {
  it('wraps Person in ProfilePage', () => {
    const ld = buildProfilePageJsonLd({
      handle: 'alice.bsky.social',
      displayName: 'Alice',
      headline: 'Engineer',
      positions: [],
      education: [],
      skills: [],
    });

    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('ProfilePage');
    expect(ld.mainEntity['@type']).toBe('Person');
    expect(ld.mainEntity.name).toBe('Alice');
    expect(ld.url).toBe('https://sifa.id/p/alice.bsky.social');
  });

  it('does not duplicate @context on nested Person', () => {
    const ld = buildProfilePageJsonLd({
      handle: 'alice.bsky.social',
    });

    expect(ld['@context']).toBe('https://schema.org');
    expect('@context' in ld.mainEntity).toBe(false);
  });
});

// Task 6: Full-profile integration test
describe('Full-profile integration', () => {
  it('handles a fully-populated profile', () => {
    const ld = buildProfilePageJsonLd({
      handle: 'alice.bsky.social',
      displayName: 'Alice Smith',
      headline: 'CTO at Acme',
      about: 'Building the future',
      avatar: 'https://cdn.example.com/alice.jpg',
      website: 'https://alice.dev',
      location: { city: 'Amsterdam', country: 'Netherlands', countryCode: 'NL' },
      positions: [{ company: 'Acme', title: 'CTO', startedAt: '2023-01' }],
      education: [{ institution: 'MIT', degree: 'MSc', fieldOfStudy: 'Computer Science' }],
      skills: [{ name: 'TypeScript' }, { name: 'Leadership' }],
      certifications: [
        {
          name: 'AWS SA Pro',
          issuingOrg: 'Amazon',
          credentialUrl: 'https://aws.amazon.com/cert/123',
        },
      ],
      volunteering: [{ organization: 'Code for All', role: 'Mentor' }],
      honors: [{ title: 'CTO of the Year' }],
      languages: [{ language: 'English' }, { language: 'Dutch' }],
      verifiedAccounts: [
        { platform: 'github', identifier: 'alice', url: 'https://github.com/alice' },
      ],
    });

    expect(ld['@type']).toBe('ProfilePage');
    const person = ld.mainEntity;
    expect(person['@type']).toBe('Person');
    expect(person.worksFor).toHaveLength(1);
    expect(person.hasCredential).toHaveLength(2); // 1 degree + 1 cert
    expect(person.memberOf).toHaveLength(1);
    expect(person.award).toEqual(['CTO of the Year']);
    expect(person.knowsLanguage).toEqual(['English', 'Dutch']);
    expect(person.knowsAbout).toEqual(['TypeScript', 'Leadership']);
    expect(person.sameAs).toContain('https://alice.dev');
    expect(person.sameAs).toContain('https://github.com/alice');
  });
});

describe('Meta description generation', () => {
  it('combines headline and position', () => {
    const desc = buildMetaDescription({
      handle: 'alice.bsky.social',
      headline: 'Senior Engineer',
      positions: [{ company: 'Acme', title: 'Senior Engineer' }],
    });
    expect(desc).toContain('Senior Engineer');
    expect(desc).toContain('at Acme');
  });

  it('includes location', () => {
    const desc = buildMetaDescription({
      handle: 'alice.bsky.social',
      headline: 'Dev',
      location: { country: 'Amsterdam' },
    });
    expect(desc).toContain('Amsterdam');
  });

  it('falls back to handle when no data', () => {
    const desc = buildMetaDescription({ handle: 'bob.bsky.social' });
    expect(desc).toBe('bob.bsky.social on Sifa');
  });

  it('uses displayName in fallback', () => {
    const desc = buildMetaDescription({
      handle: 'bob.bsky.social',
      displayName: 'Bob Smith',
    });
    expect(desc).toBe('Bob Smith on Sifa');
  });
});
