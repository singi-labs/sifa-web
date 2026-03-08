'use client';

import type { SifaSkill } from '@/lib/import/field-mapper';
import { Badge } from '@/components/ui/badge';

interface SkillsListProps {
  skills: SifaSkill[];
  onRemove: (index: number) => void;
}

export function SkillsList({ skills, onRemove }: SkillsListProps) {
  if (skills.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">No skills found in export.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2 py-4">
      {skills.map((skill, i) => (
        <Badge key={i} variant="secondary" className="gap-1.5">
          {skill.skillName}
          <button
            type="button"
            className="ms-1 text-muted-foreground hover:text-foreground"
            onClick={() => onRemove(i)}
            aria-label={`Remove ${skill.skillName}`}
          >
            &times;
          </button>
        </Badge>
      ))}
    </div>
  );
}
