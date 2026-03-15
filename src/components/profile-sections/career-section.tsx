'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { TimelineSection, TimelineEntry, formatTimelineDate } from './timeline';
import { SectionEditor, EditableEntry } from '@/components/profile-editor';
import { PositionEditDialog, positionFormToData } from '@/components/position-edit-dialog';
import { useProfileEdit } from '@/components/profile-edit-provider';
import {
  createPosition,
  updatePosition,
  deletePosition,
} from '@/lib/profile-api';
import { Badge } from '@/components/ui/badge';
import type { ProfilePosition, ProfileSkill, SkillRef } from '@/lib/types';

type DialogState = { mode: 'add' } | { mode: 'edit'; item: ProfilePosition };

interface CareerSectionProps {
  positions: ProfilePosition[];
  isOwnProfile?: boolean;
}

export function CareerSection({ isOwnProfile }: CareerSectionProps) {
  const t = useTranslations('sections');
  const { profile, addItem, updateItem, removeItem } = useProfileEdit();
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const positions = profile.positions;

  const handleSave = useCallback(
    async (
      values: Record<string, string | boolean>,
      skillRefs: SkillRef[],
      linkedSkills: ProfileSkill[],
    ): Promise<{ success: boolean; error?: string }> => {
      const data = positionFormToData(values, skillRefs);

      if (dialog?.mode === 'edit') {
        const result = await updatePosition(dialog.item.rkey, data);
        if (result.success) {
          updateItem('positions', dialog.item.rkey, {
            ...data,
            linkedSkills,
          });
          setDialog(null);
          toast.success(`${t('career')} updated`);
        }
        return result;
      }

      // Add mode
      const result = await createPosition(data);
      if (result.success && result.rkey) {
        addItem('positions', {
          ...data,
          rkey: result.rkey,
          linkedSkills,
        } as Record<string, unknown> & { rkey: string });
        setDialog(null);
        toast.success(`${t('career')} added`);
      }
      return result;
    },
    [dialog, t, addItem, updateItem],
  );

  const handleDelete = useCallback(
    async (rkey: string) => {
      const result = await deletePosition(rkey);
      if (result.success) {
        removeItem('positions', rkey);
        toast.success(`${t('career')} removed`);
      } else {
        toast.error(result.error ?? 'Failed to delete');
      }
    },
    [t, removeItem],
  );

  if (!positions.length && !isOwnProfile) return null;

  return (
    <TimelineSection title={t('career')}>
      <SectionEditor
        sectionTitle={t('career')}
        isOwnProfile={isOwnProfile}
        onAdd={() => setDialog({ mode: 'add' })}
      >
        {positions.map((pos) => {
          const controls = isOwnProfile
            ? {
                onEdit: () => setDialog({ mode: 'edit', item: pos }),
                onDelete: () => handleDelete(pos.rkey),
              }
            : undefined;
          return (
            <EditableEntry
              key={pos.rkey}
              isOwnProfile={isOwnProfile}
              onEdit={controls?.onEdit ?? (() => {})}
              onDelete={controls?.onDelete ?? (() => {})}
              entryLabel={`${pos.title} at ${pos.companyName}`}
            >
              <TimelineEntry
                title={pos.title}
                subtitle={pos.companyName}
                dateRange={formatDateRange(pos.startDate, pos.endDate, pos.current)}
                description={pos.description}
                isLast={false}
              >
                <PositionSkillChips skills={pos.linkedSkills} />
              </TimelineEntry>
            </EditableEntry>
          );
        })}
      </SectionEditor>

      {dialog && (
        <PositionEditDialog
          title={dialog.mode === 'add' ? `Add ${t('career')}` : `Edit ${t('career')}`}
          position={dialog.mode === 'edit' ? dialog.item : undefined}
          onSave={handleSave}
          onCancel={() => setDialog(null)}
        />
      )}
    </TimelineSection>
  );
}

function formatDateRange(start: string, end?: string, current?: boolean): string {
  const s = formatTimelineDate(start);
  if (current) return `${s} - Present`;
  if (end) return `${s} - ${formatTimelineDate(end)}`;
  return s;
}

interface PositionSkillChipsProps {
  skills?: ProfileSkill[];
}

function PositionSkillChips({ skills }: PositionSkillChipsProps) {
  if (!skills?.length) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1" aria-label="Position skills">
      {skills.map((skill) => (
        <Badge key={skill.rkey} variant="outline" className="text-xs">
          {skill.skillName}
        </Badge>
      ))}
    </div>
  );
}
