export const SKILL_CATEGORIES = [
  { value: 'technical', label: 'Technical' },
  { value: 'business', label: 'Business' },
  { value: 'creative', label: 'Creative' },
  { value: 'interpersonal', label: 'Interpersonal' },
  { value: 'industry', label: 'Industry' },
  { value: 'community', label: 'Community' },
  { value: 'security', label: 'Security' },
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number]['value'];
