import { describe, it, expect } from 'vitest';
import { groupSkillsByCategory, CATEGORY_ORDER, CATEGORY_LABELS } from '@/lib/skill-grouping';
import type { ProfileSkill } from '@/lib/types';

function skill(overrides: Partial<ProfileSkill> & { rkey: string; name: string }): ProfileSkill {
  return { endorsementCount: 0, ...overrides };
}

describe('groupSkillsByCategory', () => {
  it('groups skills by their category', () => {
    const skills: ProfileSkill[] = [
      skill({ rkey: '1', name: 'TypeScript', category: 'technical' }),
      skill({ rkey: '2', name: 'Negotiation', category: 'business' }),
      skill({ rkey: '3', name: 'Rust', category: 'technical' }),
    ];

    const result = groupSkillsByCategory(skills);
    expect(result).toHaveLength(2);
    expect(result[0]![0]).toBe('technical');
    expect(result[0]![1]).toHaveLength(2);
    expect(result[1]![0]).toBe('business');
    expect(result[1]![1]).toHaveLength(1);
  });

  it('returns groups in the defined category order', () => {
    const skills: ProfileSkill[] = [
      skill({ rkey: '1', name: 'Drawing', category: 'creative' }),
      skill({ rkey: '2', name: 'TypeScript', category: 'technical' }),
      skill({ rkey: '3', name: 'Empathy', category: 'interpersonal' }),
      skill({ rkey: '4', name: 'Budgeting', category: 'business' }),
      skill({ rkey: '5', name: 'Healthcare', category: 'industry' }),
    ];

    const result = groupSkillsByCategory(skills);
    const categories = result.map(([cat]) => cat);
    expect(categories).toEqual(['technical', 'business', 'creative', 'interpersonal', 'industry']);
  });

  it('places uncategorized skills in "other" at the bottom', () => {
    const skills: ProfileSkill[] = [
      skill({ rkey: '1', name: 'TypeScript', category: 'technical' }),
      skill({ rkey: '2', name: 'Mystery', category: '' }),
      skill({ rkey: '3', name: 'Unknown' }),
    ];

    const result = groupSkillsByCategory(skills);
    expect(result).toHaveLength(2);
    expect(result[0]![0]).toBe('technical');
    expect(result[1]![0]).toBe('other');
    expect(result[1]![1]).toHaveLength(2);
  });

  it('places skills with unrecognised categories in "other"', () => {
    const skills: ProfileSkill[] = [
      skill({ rkey: '1', name: 'React', category: 'Frontend' }),
      skill({ rkey: '2', name: 'Vue', category: 'not-a-real-category' }),
    ];

    const result = groupSkillsByCategory(skills);
    expect(result).toHaveLength(1);
    expect(result[0]![0]).toBe('other');
    expect(result[0]![1]).toHaveLength(2);
  });

  it('handles case-insensitive category matching', () => {
    const skills: ProfileSkill[] = [
      skill({ rkey: '1', name: 'TypeScript', category: 'Technical' }),
      skill({ rkey: '2', name: 'Rust', category: 'TECHNICAL' }),
      skill({ rkey: '3', name: 'Go', category: 'technical' }),
    ];

    const result = groupSkillsByCategory(skills);
    expect(result).toHaveLength(1);
    expect(result[0]![0]).toBe('technical');
    expect(result[0]![1]).toHaveLength(3);
  });

  it('sorts within groups by endorsement count desc then alphabetical', () => {
    const skills: ProfileSkill[] = [
      skill({ rkey: '1', name: 'Zod', category: 'technical', endorsementCount: 3 }),
      skill({ rkey: '2', name: 'React', category: 'technical', endorsementCount: 10 }),
      skill({ rkey: '3', name: 'Angular', category: 'technical', endorsementCount: 3 }),
      skill({ rkey: '4', name: 'Vue', category: 'technical', endorsementCount: 0 }),
    ];

    const result = groupSkillsByCategory(skills);
    const names = result[0]![1].map((s) => s.name);
    // React (10), Angular (3, alpha), Zod (3, alpha), Vue (0)
    expect(names).toEqual(['React', 'Angular', 'Zod', 'Vue']);
  });

  it('treats undefined endorsementCount as 0', () => {
    const skills: ProfileSkill[] = [
      skill({ rkey: '1', name: 'A', category: 'technical', endorsementCount: undefined }),
      skill({ rkey: '2', name: 'B', category: 'technical', endorsementCount: 1 }),
    ];

    const result = groupSkillsByCategory(skills);
    expect(result[0]![1][0]!.name).toBe('B');
    expect(result[0]![1][1]!.name).toBe('A');
  });

  it('omits empty groups', () => {
    const skills: ProfileSkill[] = [
      skill({ rkey: '1', name: 'TypeScript', category: 'technical' }),
    ];

    const result = groupSkillsByCategory(skills);
    expect(result).toHaveLength(1);
    expect(result[0]![0]).toBe('technical');
  });

  it('returns empty array for empty input', () => {
    expect(groupSkillsByCategory([])).toEqual([]);
  });

  it('handles a single skill with no category', () => {
    const skills: ProfileSkill[] = [skill({ rkey: '1', name: 'Misc' })];

    const result = groupSkillsByCategory(skills);
    expect(result).toHaveLength(1);
    expect(result[0]![0]).toBe('other');
    expect(result[0]![1][0]!.name).toBe('Misc');
  });

  it('all skills in same category produce a single group', () => {
    const skills: ProfileSkill[] = [
      skill({ rkey: '1', name: 'A', category: 'business' }),
      skill({ rkey: '2', name: 'B', category: 'business' }),
    ];

    const result = groupSkillsByCategory(skills);
    expect(result).toHaveLength(1);
    expect(result[0]![0]).toBe('business');
  });
});

describe('CATEGORY_ORDER', () => {
  it('contains exactly the 7 valid categories', () => {
    expect(CATEGORY_ORDER).toEqual([
      'technical',
      'business',
      'creative',
      'interpersonal',
      'industry',
      'community',
      'security',
    ]);
  });
});

describe('CATEGORY_LABELS', () => {
  it('has a label for every category plus other', () => {
    for (const cat of CATEGORY_ORDER) {
      expect(CATEGORY_LABELS[cat]).toBeDefined();
    }
    expect(CATEGORY_LABELS['other']).toBe('Other');
  });
});
