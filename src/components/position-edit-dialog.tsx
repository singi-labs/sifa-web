'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MonthPicker } from '@/components/ui/month-picker';
import { X } from '@phosphor-icons/react';
import { PositionSkillEditor } from '@/components/position-skill-editor';
import { useProfileEdit } from '@/components/profile-edit-provider';
import { createSkill } from '@/lib/profile-api';
import type { ProfilePosition, ProfileSkill, SkillRef } from '@/lib/types';
import { trackEvent } from '@/lib/analytics';
import { formatLocation, parseLocationString } from '@/lib/location-utils';

/** Normalise a partial date to YYYY-MM for the month input. */
const toMonth = (v: string | undefined): string => {
  if (!v) return '';
  if (/^\d{4}$/.test(v)) return `${v}-01`;
  return v;
};

interface PositionEditDialogProps {
  title: string;
  position?: ProfilePosition;
  onSave: (
    values: Record<string, string | boolean>,
    skillRefs: SkillRef[],
    linkedSkills: ProfileSkill[],
  ) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
}

export function PositionEditDialog({ title, position, onSave, onCancel }: PositionEditDialogProps) {
  const t = useTranslations('editor');
  const { profile } = useProfileEdit();

  const [values, setValues] = useState<Record<string, string | boolean>>(() => ({
    title: position?.title ?? '',
    companyName: position?.companyName ?? '',
    startDate: toMonth(position?.startDate),
    endDate: toMonth(position?.endDate),
    current: position?.current ?? false,
    location: position?.location ? formatLocation(position.location) : '',
    description: position?.description ?? '',
  }));

  const [linkedSkills, setLinkedSkills] = useState<ProfileSkill[]>(
    () => position?.linkedSkills ?? [],
  );
  const [skillRefs, setSkillRefs] = useState<SkillRef[]>(() => position?.skills ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddSkill = useCallback(
    async (skillName: string, category: string) => {
      // Check if already linked
      if (linkedSkills.some((s) => s.skillName.toLowerCase() === skillName.toLowerCase())) {
        return;
      }

      // Check if skill exists on user's profile
      const existingSkill = profile.skills.find(
        (s) => s.skillName.toLowerCase() === skillName.toLowerCase(),
      );

      if (existingSkill) {
        // Link existing skill
        setLinkedSkills((prev) => [...prev, existingSkill]);
        // Use a placeholder ref -- the API will resolve the real CID
        setSkillRefs((prev) => [
          ...prev,
          { uri: `at://${profile.did}/id.sifa.profile.skill/${existingSkill.rkey}`, cid: '' },
        ]);
        return;
      }

      // Create new skill record, then link it
      const result = await createSkill({
        skillName,
        category: category || undefined,
      });

      if (result.success && result.rkey) {
        const newSkill: ProfileSkill = {
          rkey: result.rkey,
          skillName,
          category: category || undefined,
        };
        setLinkedSkills((prev) => [...prev, newSkill]);
        setSkillRefs((prev) => [
          ...prev,
          { uri: `at://${profile.did}/id.sifa.profile.skill/${result.rkey}`, cid: '' },
        ]);
      }
    },
    [linkedSkills, profile.skills, profile.did],
  );

  const handleRemoveSkill = useCallback((rkey: string) => {
    setLinkedSkills((prev) => prev.filter((s) => s.rkey !== rkey));
    setSkillRefs((prev) => prev.filter((ref) => !ref.uri.endsWith(`/${rkey}`)));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await onSave(values, skillRefs, linkedSkills);
    setSaving(false);
    if (result.success) {
      trackEvent('profile-edit', { section: 'position' });
    } else {
      setError(result.error ?? t('failedToSave'));
    }
  };

  const updateValue = (name: string, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-label={title}
      aria-modal="true"
    >
      <div className="mx-4 w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onCancel}
            aria-label={t('close')}
          >
            <X className="h-4 w-4" weight="bold" aria-hidden="true" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PositionFormFields values={values} onUpdate={updateValue} />

          <PositionSkillEditor
            linkedSkills={linkedSkills}
            profileSkills={profile.skills}
            onAdd={handleAddSkill}
            onRemove={handleRemoveSkill}
          />

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? t('saving') : t('save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface PositionFormFieldsProps {
  values: Record<string, string | boolean>;
  onUpdate: (name: string, value: string | boolean) => void;
}

function PositionFormFields({ values, onUpdate }: PositionFormFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="edit-title" className="mb-1 block text-sm font-medium">
          Job Title<span className="text-destructive"> *</span>
        </label>
        <Input
          id="edit-title"
          value={values.title as string}
          onChange={(e) => onUpdate('title', e.target.value)}
          required
          placeholder="Software Engineer"
        />
      </div>
      <div>
        <label htmlFor="edit-companyName" className="mb-1 block text-sm font-medium">
          Company<span className="text-destructive"> *</span>
        </label>
        <Input
          id="edit-companyName"
          value={values.companyName as string}
          onChange={(e) => onUpdate('companyName', e.target.value)}
          required
          placeholder="Acme Corp"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="edit-startDate" className="mb-1 block text-sm font-medium">
            Start Date<span className="text-destructive"> *</span>
          </label>
          <MonthPicker
            id="edit-startDate"
            value={values.startDate as string}
            onChange={(v) => onUpdate('startDate', v)}
            required
          />
        </div>
        {!values.current && (
          <div>
            <label htmlFor="edit-endDate" className="mb-1 block text-sm font-medium">
              End Date
            </label>
            <MonthPicker
              id="edit-endDate"
              value={values.endDate as string}
              onChange={(v) => onUpdate('endDate', v)}
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          id="edit-current"
          type="checkbox"
          className="h-4 w-4 rounded border-border"
          checked={values.current as boolean}
          onChange={(e) => {
            onUpdate('current', e.target.checked);
            if (e.target.checked) {
              onUpdate('endDate', '');
            }
          }}
        />
        <label htmlFor="edit-current" className="text-sm text-muted-foreground">
          I currently work here
        </label>
      </div>
      <div>
        <label htmlFor="edit-location" className="mb-1 block text-sm font-medium">
          Location
        </label>
        <Input
          id="edit-location"
          value={values.location as string}
          onChange={(e) => onUpdate('location', e.target.value)}
          placeholder="Amsterdam, Netherlands"
        />
      </div>
      <div>
        <label htmlFor="edit-description" className="mb-1 block text-sm font-medium">
          Description
        </label>
        <textarea
          id="edit-description"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          rows={4}
          value={values.description as string}
          onChange={(e) => onUpdate('description', e.target.value)}
          placeholder="Describe your role..."
        />
      </div>
    </>
  );
}

/** Convert position form values back to API data, including skill refs. */
export function positionFormToData(
  values: Record<string, string | boolean>,
  skillRefs: SkillRef[],
): Record<string, unknown> {
  return {
    title: values.title as string,
    companyName: values.companyName as string,
    startDate: values.startDate as string,
    endDate: (values.endDate as string) || undefined,
    current: values.current as boolean,
    location: (values.location as string)
      ? (parseLocationString(values.location as string) ?? undefined)
      : undefined,
    description: (values.description as string) || undefined,
    skills: skillRefs.length > 0 ? skillRefs : undefined,
  };
}
