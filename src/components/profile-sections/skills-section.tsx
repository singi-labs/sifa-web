'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import type { ProfileSkill } from '@/lib/types';

interface SkillsSectionProps {
  skills: ProfileSkill[];
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  const t = useTranslations('sections');

  if (!skills.length) return null;

  // Group by category
  const grouped = new Map<string, ProfileSkill[]>();
  for (const skill of skills) {
    const cat = skill.category ?? '';
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(skill);
  }

  return (
    <section className="mt-8" aria-label={t('skills')}>
      <h2 className="mb-4 text-xl font-semibold">{t('skills')}</h2>
      {Array.from(grouped.entries()).map(([category, categorySkills]) => (
        <div key={category} className={category ? 'mt-3' : ''}>
          {category && (
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">{category}</h3>
          )}
          <div className="flex flex-wrap gap-2">
            {categorySkills.map((skill) => (
              <Badge key={skill.rkey} variant="secondary">
                {skill.skillName}
                {skill.endorsementCount != null && skill.endorsementCount > 0 && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    {skill.endorsementCount}
                  </span>
                )}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
