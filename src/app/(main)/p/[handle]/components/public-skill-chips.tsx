'use client';

import { SkillChip } from '@/components/skill-chip';

interface Skill {
  name: string;
  category?: string;
  endorsed?: boolean;
  activityBacked?: boolean;
}

export function PublicSkillChips({ skills }: { skills: Skill[] }) {
  return (
    <>
      {skills.map((skill, i) => (
        <SkillChip key={`${skill.name}-${i}`} skill={{ rkey: `pub-${i}`, ...skill }} />
      ))}
    </>
  );
}
