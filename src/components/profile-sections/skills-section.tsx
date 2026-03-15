'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { PencilSimple } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { SkillChip } from '@/components/skill-chip';
import { SectionEditor } from '@/components/profile-editor';
import { SkillEditDialog } from '@/components/skill-edit-dialog';
import { valuesToSkill } from '@/components/profile-editor/section-converters';
import { useProfileEdit } from '@/components/profile-edit-provider';
import { createSkill, updateSkill, deleteSkill } from '@/lib/profile-api';
import type { ProfileSkill } from '@/lib/types';

type DialogState = { mode: 'add' } | { mode: 'edit'; item: ProfileSkill };

interface SkillsSectionProps {
  skills: ProfileSkill[];
  isOwnProfile?: boolean;
}

export function SkillsSection({ isOwnProfile }: SkillsSectionProps) {
  const t = useTranslations('sections');
  const { profile, addItem, updateItem, removeItem } = useProfileEdit();
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [editing, setEditing] = useState(false);

  const skills = profile.skills;

  const handleSave = useCallback(
    async (
      values: Record<string, string | boolean>,
    ): Promise<{ success: boolean; error?: string }> => {
      const data = valuesToSkill(values) as Record<string, unknown>;

      if (dialog?.mode === 'edit') {
        const result = await updateSkill(dialog.item.rkey, data);
        if (result.success) {
          updateItem('skills', dialog.item.rkey, data);
          setDialog(null);
          toast.success(`${t('skills')} updated`);
        }
        return result;
      }

      const result = await createSkill(data);
      if (result.success && result.rkey) {
        addItem('skills', { ...data, rkey: result.rkey } as Record<string, unknown> & {
          rkey: string;
        });
        setDialog(null);
        toast.success(`${t('skills')} added`);
      }
      return result;
    },
    [dialog, t, addItem, updateItem],
  );

  const handleDelete = useCallback(
    async (rkey: string) => {
      const result = await deleteSkill(rkey);
      if (result.success) {
        removeItem('skills', rkey);
        toast.success(`${t('skills')} removed`);
      } else {
        toast.error(result.error ?? 'Failed to delete');
      }
    },
    [t, removeItem],
  );

  if (!skills.length && !isOwnProfile) return null;

  // Group by category
  const grouped = new Map<string, ProfileSkill[]>();
  for (const skill of skills) {
    const cat = skill.category ?? '';
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(skill);
  }

  return (
    <section className="mt-8" aria-label={t('skills')}>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-xl font-semibold">{t('skills')}</h2>
        {isOwnProfile && skills.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setEditing(!editing)}
            aria-label={editing ? 'Done editing skills' : 'Edit skills'}
          >
            {editing ? (
              'Done'
            ) : (
              <PencilSimple className="h-3.5 w-3.5" weight="bold" aria-hidden="true" />
            )}
          </Button>
        )}
      </div>
      <SectionEditor
        sectionTitle={t('skills')}
        isOwnProfile={isOwnProfile}
        onAdd={() => setDialog({ mode: 'add' })}
      >
        {Array.from(grouped.entries()).map(([category, categorySkills]) => (
          <div key={category} className={category ? 'mt-3' : ''}>
            {category && (
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">{category}</h3>
            )}
            <div className="flex flex-wrap gap-2">
              {categorySkills.map((skill) => (
                <SkillChip
                  key={skill.rkey}
                  skill={skill}
                  editable={isOwnProfile}
                  editing={editing}
                  onEdit={() => setDialog({ mode: 'edit', item: skill })}
                  onDelete={() => void handleDelete(skill.rkey)}
                />
              ))}
            </div>
          </div>
        ))}
      </SectionEditor>
      {dialog && (
        <SkillEditDialog
          title={dialog.mode === 'add' ? `Add ${t('skills')}` : `Edit ${t('skills')}`}
          initialSkillName={dialog.mode === 'edit' ? dialog.item.skillName : undefined}
          initialCategory={dialog.mode === 'edit' ? dialog.item.category : undefined}
          onSave={handleSave}
          onCancel={() => setDialog(null)}
        />
      )}
    </section>
  );
}
