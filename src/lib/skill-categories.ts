export const SKILL_CATEGORIES = [
  { value: 'technical', label: 'Technical' },
  { value: 'business', label: 'Business' },
  { value: 'creative', label: 'Creative' },
  { value: 'interpersonal', label: 'Interpersonal' },
  { value: 'language', label: 'Language' },
  { value: 'industry', label: 'Industry' },
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number]['value'];
