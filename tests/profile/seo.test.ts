import { describe, it, expect } from 'vitest';
import { buildPersonJsonLd, buildMetaDescription } from '@/lib/jsonld';

describe('JSON-LD generation', () => {
  it('builds Schema.org Person from profile', () => {
    const ld = buildPersonJsonLd({
      handle: 'alice.bsky.social',
      headline: 'Senior Engineer',
      about: 'Building things',
      positions: [{ companyName: 'Acme', current: true }],
      education: [{ institution: 'MIT' }],
      skills: [{ skillName: 'TypeScript' }],
    });

    expect(ld['@type']).toBe('Person');
    expect(ld.jobTitle).toBe('Senior Engineer');
    expect(ld.worksFor).toBeDefined();
    expect(ld.worksFor!.name).toBe('Acme');
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
});

describe('Meta description generation', () => {
  it('combines headline and position', () => {
    const desc = buildMetaDescription({
      handle: 'alice.bsky.social',
      headline: 'Senior Engineer',
      positions: [{ companyName: 'Acme', title: 'Senior Engineer', current: true }],
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
