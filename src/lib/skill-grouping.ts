import type { ProfileSkill } from '@/lib/types';

export const CATEGORY_ORDER = [
  'technical',
  'business',
  'creative',
  'interpersonal',
  'industry',
] as const;

export type SkillCategory = (typeof CATEGORY_ORDER)[number];

export const CATEGORY_LABELS: Record<string, string> = {
  technical: 'Technical',
  business: 'Business',
  creative: 'Creative',
  interpersonal: 'Interpersonal',
  industry: 'Industry',
  other: 'Other',
};

/**
 * Groups skills by category in a defined display order.
 *
 * - Known categories appear in CATEGORY_ORDER
 * - Skills with no category or unrecognised categories go to "other"
 * - Within each group: sorted by endorsementCount desc, then alphabetical by skillName
 * - Empty groups are omitted
 */
export function groupSkillsByCategory(skills: ProfileSkill[]): [string, ProfileSkill[]][] {
  const grouped = new Map<string, ProfileSkill[]>();

  for (const skill of skills) {
    const normalised = skill.category?.toLowerCase().trim() ?? '';
    const key = (CATEGORY_ORDER as readonly string[]).includes(normalised) ? normalised : 'other';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(skill);
  }

  // Sort within each group
  for (const [, groupSkills] of grouped) {
    groupSkills.sort((a, b) => {
      const countDiff = (b.endorsementCount ?? 0) - (a.endorsementCount ?? 0);
      if (countDiff !== 0) return countDiff;
      return a.skillName.localeCompare(b.skillName);
    });
  }

  // Build ordered entries: known categories first, then "other"
  const ordered: [string, ProfileSkill[]][] = [];
  for (const cat of CATEGORY_ORDER) {
    const group = grouped.get(cat);
    if (group?.length) ordered.push([cat, group]);
  }
  const otherGroup = grouped.get('other');
  if (otherGroup?.length) ordered.push(['other', otherGroup]);

  return ordered;
}
