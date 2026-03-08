import { describe, it, expect } from 'vitest';
import { buildPersonJsonLd } from '@/lib/jsonld';

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
});
