'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { SectionEditor, EditableEntry } from '@/components/profile-editor';
import { EditDialog } from '@/components/profile-editor/edit-dialog';
import { SKILL_FIELDS } from '@/components/profile-editor/form-fields';
import { skillToValues, valuesToSkill } from '@/components/profile-editor/section-converters';
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
      <h2 className="mb-4 text-xl font-semibold">{t('skills')}</h2>
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
                <EditableEntry
                  key={skill.rkey}
                  isOwnProfile={isOwnProfile}
                  onEdit={() => setDialog({ mode: 'edit', item: skill })}
                  onDelete={() => handleDelete(skill.rkey)}
                  entryLabel={skill.skillName}
                >
                  <Badge variant="secondary">
                    {skill.skillName}
                    {skill.endorsementCount != null && skill.endorsementCount > 0 && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {skill.endorsementCount}
                      </span>
                    )}
                  </Badge>
                </EditableEntry>
              ))}
            </div>
          </div>
        ))}
      </SectionEditor>
      {dialog && (
        <EditDialog
          title={dialog.mode === 'add' ? `Add ${t('skills')}` : `Edit ${t('skills')}`}
          fields={SKILL_FIELDS}
          initialValues={dialog.mode === 'edit' ? skillToValues(dialog.item) : undefined}
          onSave={handleSave}
          onCancel={() => setDialog(null)}
        />
      )}
    </section>
  );
}
