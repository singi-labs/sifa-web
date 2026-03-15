'use client';

import { useState, useCallback } from 'react';
import { X } from '@phosphor-icons/react';
import { SkillCombobox } from '@/components/skill-combobox';
import { Badge } from '@/components/ui/badge';
import type { ProfileSkill } from '@/lib/types';

interface PositionSkillEditorProps {
  linkedSkills: ProfileSkill[];
  onAdd: (skillName: string, category: string) => void;
  onRemove: (rkey: string) => void;
}

export function PositionSkillEditor({ linkedSkills, onAdd, onRemove }: PositionSkillEditorProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  const handleChange = useCallback((skillName: string, cat: string) => {
    setQuery(skillName);
    setCategory(cat);
  }, []);

  const handleSelect = useCallback(
    (skillName: string, cat: string) => {
      if (skillName.trim().length < 2) return;
      onAdd(skillName.trim(), cat);
      setQuery('');
      setCategory('');
    },
    [onAdd],
  );

  return (
    <div>
      <label htmlFor="position-skill-search" className="mb-1 block text-sm font-medium">
        Skills used
      </label>
      {linkedSkills.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5" role="list" aria-label="Linked skills">
          {linkedSkills.map((skill) => (
            <Badge key={skill.rkey} variant="secondary" className="gap-1" role="listitem">
              {skill.skillName}
              <button
                type="button"
                className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
                onClick={() => onRemove(skill.rkey)}
                aria-label={`Remove ${skill.skillName}`}
              >
                <X className="h-2.5 w-2.5" weight="bold" aria-hidden="true" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <SkillCombobox
        id="position-skill-search"
        value={query}
        category={category}
        onChange={handleChange}
        onSelect={handleSelect}
      />
    </div>
  );
}
