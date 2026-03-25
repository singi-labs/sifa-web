'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { SkillChip } from '@/components/skill-chip';
import { SectionEditor } from '@/components/profile-editor';
import { SkillEditDialog } from '@/components/skill-edit-dialog';
import { valuesToSkill } from '@/components/profile-editor/section-converters';
import { useProfileEdit } from '@/components/profile-edit-provider';
import {
  createSkill,
  updateSkill,
  deleteSkill,
  linkSkillToPosition,
  unlinkSkillFromPosition,
} from '@/lib/profile-api';
import { groupSkillsByCategory, CATEGORY_LABELS } from '@/lib/skill-grouping';
import type { ProfileSkill, SkillRef } from '@/lib/types';

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
  const positions = profile.positions;

  /** Build a stub SkillRef for a skill rkey. Real URI/CID come from the API; this is best-effort. */
  const buildSkillRef = useCallback(
    (skillRkey: string): SkillRef => ({
      uri: `at://${profile.did}/id.sifa.profile.skill/${skillRkey}`,
      cid: '', // CID is unknown client-side; the API will resolve it
    }),
    [profile.did],
  );

  /** Determine which positions currently link to a given skill rkey. */
  const getLinkedPositionRkeys = useCallback(
    (skillRkey: string): string[] => {
      const ref = buildSkillRef(skillRkey);
      return positions
        .filter((pos) => pos.skills?.some((s) => s.uri === ref.uri))
        .map((pos) => pos.rkey);
    },
    [positions, buildSkillRef],
  );

  const handlePositionLinkChange = useCallback(
    async (positionRkey: string, linked: boolean, skillRkey: string) => {
      const position = positions.find((p) => p.rkey === positionRkey);
      if (!position) return;

      const skillRef = buildSkillRef(skillRkey);
      const currentSkills = position.skills ?? [];

      // Optimistic update: apply immediately so checkbox feels instant
      const updatedSkills = linked
        ? [...currentSkills, skillRef]
        : currentSkills.filter((s) => s.uri !== skillRef.uri);
      updateItem('positions', positionRkey, { skills: updatedSkills });

      const result = linked
        ? await linkSkillToPosition(position, skillRef)
        : await unlinkSkillFromPosition(position, skillRef);

      if (result.success) {
        toast.success('Saved');
      } else {
        // Revert optimistic update on failure
        updateItem('positions', positionRkey, { skills: currentSkills });
        toast.error(result.error ?? 'Failed to update position');
      }
    },
    [positions, buildSkillRef, updateItem],
  );

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

  const orderedGroups = groupSkillsByCategory(skills);

  return (
    <section className="mt-8" aria-label={t('skills')}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">
          {t('skills')}
          {skills.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">{skills.length}</span>
          )}
        </h2>
      </div>
      <SectionEditor
        sectionTitle={t('skills')}
        isOwnProfile={isOwnProfile}
        onAdd={() => setDialog({ mode: 'add' })}
      >
        {orderedGroups.map(([category, categorySkills]) => (
          <div key={category} className="mt-3">
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              {CATEGORY_LABELS[category] ?? category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {categorySkills.map((skill) => (
                <SkillChip
                  key={skill.rkey}
                  skill={skill}
                  editable={isOwnProfile}
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
          initialSkillName={dialog.mode === 'edit' ? dialog.item.name : undefined}
          initialCategory={dialog.mode === 'edit' ? dialog.item.category : undefined}
          isEditMode={dialog.mode === 'edit'}
          profileSkills={skills}
          positions={positions}
          linkedPositionRkeys={
            dialog.mode === 'edit' ? getLinkedPositionRkeys(dialog.item.rkey) : undefined
          }
          onPositionLinkChange={
            dialog.mode === 'edit'
              ? (posRkey, linked) =>
                  void handlePositionLinkChange(posRkey, linked, dialog.item.rkey)
              : undefined
          }
          onSave={handleSave}
          onDelete={
            dialog.mode === 'edit'
              ? () => {
                  void handleDelete(dialog.item.rkey);
                  setDialog(null);
                }
              : undefined
          }
          onCancel={() => setDialog(null)}
        />
      )}
    </section>
  );
}
