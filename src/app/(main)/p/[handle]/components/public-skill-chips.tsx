'use client';

import { SkillChip } from '@/components/skill-chip';

interface Skill {
  skillName: string;
  category?: string;
  endorsed?: boolean;
  activityBacked?: boolean;
}

export function PublicSkillChips({ skills }: { skills: Skill[] }) {
  return (
    <>
      {skills.map((skill, i) => (
        <SkillChip
          key={`${skill.skillName}-${i}`}
          skill={{ rkey: `pub-${i}`, ...skill }}
        />
      ))}
    </>
  );
}
