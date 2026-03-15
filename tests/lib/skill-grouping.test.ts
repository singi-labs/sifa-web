import { describe, it, expect } from 'vitest';
import { groupSkillsByCategory, CATEGORY_ORDER, CATEGORY_LABELS } from '@/lib/skill-grouping';
import type { ProfileSkill } from '@/lib/types';

function skill(overrides: Partial<ProfileSkill> & { rkey: string; skillName: string }): ProfileSkill {
  return { endorsementCount: 0, ...overrides };
}

describe('groupSkillsByCategory', () => {
  it('groups skills by their category', () => {
    const skills: ProfileSkill[] = [
      skill({ rkey: '1', skillName: 'TypeScript', category: 'technical' }),
      skill({ rkey: '2', skillName: 'Negotiation', category: 'business' }),
      skill({ rkey: '3', skillName: 'Rust', category: 'technical' }),
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
      skill({ rkey: '1', skillName: 'Drawing', category: 'creative' }),
      skill({ rkey: '2', skillName: 'TypeScript', category: 'technical' }),
      skill({ rkey: '3', skillName: 'Empathy', category: 'interpersonal' }),
      skill({ rkey: '4', skillName: 'Budgeting', category: 'business' }),
      skill({ rkey: '5', skillName: 'English', category: 'language' }),
      skill({ rkey: '6', skillName: 'Healthcare', category: 'industry' }),
    ];

    const result = groupSkillsByCategory(skills);
    const categories = result.map(([cat]) => cat);
    expect(categories).toEqual([
      'technical',
      'business',
      'creative',
      'interpersonal',
      'language',
      'industry',
    ]);
  });

  it('places uncategorized skills in "other" at the bottom', () => {
    const skills: ProfileSkill[] = [
      skill({ rkey: '1', skillName: 'TypeScript', category: 'technical' }),
      skill({ rkey: '2', skillName: 'Mystery', category: '' }),
      skill({ rkey: '3', skillName: 'Unknown' }),
    ];

    const result = groupSkillsByCategory(skills);
    expect(result).toHaveLength(2);
    expect(result[0]![0]).toBe('technical');
    expect(result[1]![0]).toBe('other');
    expect(result[1]![1]).toHaveLength(2);
  });

  it('places skills with unrecognised categories in "other"', () => {
    const skills: ProfileSkill[] = [
      skill({ rkey: '1', skillName: 'React', category: 'Frontend' }),
      skill({ rkey: '2', skillName: 'Vue', category: 'not-a-real-category' }),
    ];

    const result = groupSkillsByCategory(skills);
    expect(result).toHaveLength(1);
    expect(result[0]![0]).toBe('other');
    expect(result[0]![1]).toHaveLength(2);
  });

  it('handles case-insensitive category matching', () => {
    const skills: ProfileSkill[] = [
      skill({ rkey: '1', skillName: 'TypeScript', category: 'Technical' }),
      skill({ rkey: '2', skillName: 'Rust', category: 'TECHNICAL' }),
      skill({ rkey: '3', skillName: 'Go', category: 'technical' }),
    ];

    const result = groupSkillsByCategory(skills);
    expect(result).toHaveLength(1);
    expect(result[0]![0]).toBe('technical');
    expect(result[0]![1]).toHaveLength(3);
  });

  it('sorts within groups by endorsement count desc then alphabetical', () => {
    const skills: ProfileSkill[] = [
      skill({ rkey: '1', skillName: 'Zod', category: 'technical', endorsementCount: 3 }),
      skill({ rkey: '2', skillName: 'React', category: 'technical', endorsementCount: 10 }),
      skill({ rkey: '3', skillName: 'Angular', category: 'technical', endorsementCount: 3 }),
      skill({ rkey: '4', skillName: 'Vue', category: 'technical', endorsementCount: 0 }),
    ];

    const result = groupSkillsByCategory(skills);
    const names = result[0]![1].map((s) => s.skillName);
    // React (10), Angular (3, alpha), Zod (3, alpha), Vue (0)
    expect(names).toEqual(['React', 'Angular', 'Zod', 'Vue']);
  });

  it('treats undefined endorsementCount as 0', () => {
    const skills: ProfileSkill[] = [
      skill({ rkey: '1', skillName: 'A', category: 'technical', endorsementCount: undefined }),
      skill({ rkey: '2', skillName: 'B', category: 'technical', endorsementCount: 1 }),
    ];

    const result = groupSkillsByCategory(skills);
    expect(result[0]![1][0]!.skillName).toBe('B');
    expect(result[0]![1][1]!.skillName).toBe('A');
  });

  it('omits empty groups', () => {
    const skills: ProfileSkill[] = [
      skill({ rkey: '1', skillName: 'TypeScript', category: 'technical' }),
    ];

    const result = groupSkillsByCategory(skills);
    expect(result).toHaveLength(1);
    expect(result[0]![0]).toBe('technical');
  });

  it('returns empty array for empty input', () => {
    expect(groupSkillsByCategory([])).toEqual([]);
  });

  it('handles a single skill with no category', () => {
    const skills: ProfileSkill[] = [skill({ rkey: '1', skillName: 'Misc' })];

    const result = groupSkillsByCategory(skills);
    expect(result).toHaveLength(1);
    expect(result[0]![0]).toBe('other');
    expect(result[0]![1][0]!.skillName).toBe('Misc');
  });

  it('all skills in same category produce a single group', () => {
    const skills: ProfileSkill[] = [
      skill({ rkey: '1', skillName: 'A', category: 'business' }),
      skill({ rkey: '2', skillName: 'B', category: 'business' }),
    ];

    const result = groupSkillsByCategory(skills);
    expect(result).toHaveLength(1);
    expect(result[0]![0]).toBe('business');
  });
});

describe('CATEGORY_ORDER', () => {
  it('contains exactly the 6 valid categories', () => {
    expect(CATEGORY_ORDER).toEqual([
      'technical',
      'business',
      'creative',
      'interpersonal',
      'language',
      'industry',
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
