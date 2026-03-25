'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { TimelineSection, TimelineEntry, formatTimelineDate } from './timeline';
import { SectionEditor, EditableEntry } from '@/components/profile-editor';
import { SectionOverflow } from '@/components/ui/section-overflow';
import { PositionEditDialog, positionFormToData } from '@/components/position-edit-dialog';
import { useProfileEdit } from '@/components/profile-edit-provider';
import { Star } from '@phosphor-icons/react';
import {
  createPosition,
  updatePosition,
  deletePosition,
  setPositionPrimary,
  unsetPositionPrimary,
} from '@/lib/profile-api';
import { sortByDateDesc, lexiconDateExtractor } from '@/lib/sort-by-date';
import { Badge } from '@/components/ui/badge';
import type { ProfilePosition, ProfileSkill, SkillRef, LocationValue } from '@/lib/types';

type DialogState = { mode: 'add' } | { mode: 'edit'; item: ProfilePosition };

interface CareerSectionProps {
  positions: ProfilePosition[];
  isOwnProfile?: boolean;
}

export function CareerSection({ isOwnProfile }: CareerSectionProps) {
  const t = useTranslations('sections');
  const tEdit = useTranslations('profileEdit');
  const { profile, addItem, updateItem, removeItem } = useProfileEdit();
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const positions = sortByDateDesc(profile.positions, lexiconDateExtractor);

  const handleSave = useCallback(
    async (
      values: Record<string, string | boolean>,
      skillRefs: SkillRef[],
      linkedSkills: ProfileSkill[],
      location: LocationValue | null,
    ): Promise<{ success: boolean; error?: string }> => {
      const data = positionFormToData(values, skillRefs, location);

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

  const handleTogglePrimary = useCallback(
    async (pos: ProfilePosition) => {
      const newPrimary = !pos.primary;
      const result = newPrimary
        ? await setPositionPrimary(pos.rkey)
        : await unsetPositionPrimary(pos.rkey);

      if (result.success) {
        if (newPrimary) {
          for (const other of positions) {
            if (other.rkey !== pos.rkey && other.primary) {
              updateItem('positions', other.rkey, { primary: false });
            }
          }
        }
        updateItem('positions', pos.rkey, { primary: newPrimary });
        toast.success(newPrimary ? tEdit('setPrimaryPosition') : tEdit('removePrimaryPosition'));
      }
    },
    [positions, updateItem, tEdit],
  );

  if (!positions.length && !isOwnProfile) return null;

  return (
    <TimelineSection title={t('career')} itemCount={positions.length}>
      <SectionEditor
        sectionTitle={t('career')}
        isOwnProfile={isOwnProfile}
        onAdd={() => setDialog({ mode: 'add' })}
      >
        <SectionOverflow maxVisible={3} disableOverflow={isOwnProfile}>
          {positions.map((pos) => {
            const controls = isOwnProfile
              ? {
                  onEdit: () => setDialog({ mode: 'edit', item: pos }),
                  onDelete: () => handleDelete(pos.rkey),
                }
              : undefined;

            const starToggle =
              isOwnProfile && pos.current ? (
                <button
                  type="button"
                  onClick={() => void handleTogglePrimary(pos)}
                  className={`shrink-0 rounded-full p-1 transition-colors ${
                    pos.primary
                      ? 'text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  aria-label={
                    pos.primary ? tEdit('removePrimaryPosition') : tEdit('setPrimaryPosition')
                  }
                  aria-pressed={pos.primary}
                  title={pos.primary ? tEdit('removePrimaryPosition') : tEdit('setPrimaryPosition')}
                >
                  <Star size={16} weight={pos.primary ? 'fill' : 'regular'} />
                </button>
              ) : undefined;

            return (
              <EditableEntry
                key={pos.rkey}
                isOwnProfile={isOwnProfile}
                onEdit={controls?.onEdit ?? (() => {})}
                onDelete={controls?.onDelete ?? (() => {})}
                entryLabel={`${pos.title} at ${pos.company}`}
                trailingContent={starToggle}
              >
                <TimelineEntry
                  title={pos.title}
                  subtitle={pos.company}
                  dateRange={formatDateRange(pos.startedAt, pos.endedAt)}
                  description={pos.description}
                  isLast={false}
                >
                  <PositionSkillChips skills={pos.linkedSkills} />
                </TimelineEntry>
              </EditableEntry>
            );
          })}
        </SectionOverflow>
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

function formatDateRange(start: string, end?: string): string {
  const s = formatTimelineDate(start);
  if (!end) return `${s} - Present`;
  return `${s} - ${formatTimelineDate(end)}`;
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
          {skill.name}
        </Badge>
      ))}
    </div>
  );
}
