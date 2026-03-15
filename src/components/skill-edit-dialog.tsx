'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { X } from '@phosphor-icons/react';
import { SkillCombobox } from '@/components/skill-combobox';
import { PositionLinkList } from '@/components/position-link-list';
import type { ProfilePosition } from '@/lib/types';

interface SkillEditDialogProps {
  title: string;
  initialSkillName?: string;
  initialCategory?: string;
  positions?: ProfilePosition[];
  linkedPositionRkeys?: string[];
  onPositionLinkChange?: (positionRkey: string, linked: boolean) => void;
  onSave: (
    values: Record<string, string | boolean>,
  ) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  /** True when editing an existing skill (has an rkey). "Used in" section only shows in edit mode. */
  isEditMode?: boolean;
}

const CATEGORY_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'Technical', label: 'Technical' },
  { value: 'Frontend', label: 'Frontend' },
  { value: 'Backend', label: 'Backend' },
  { value: 'DevOps', label: 'DevOps' },
  { value: 'Design', label: 'Design' },
  { value: 'Management', label: 'Management' },
  { value: 'Communication', label: 'Communication' },
  { value: 'Leadership', label: 'Leadership' },
  { value: 'Other', label: 'Other' },
];

export function SkillEditDialog({
  title,
  initialSkillName = '',
  initialCategory = '',
  positions,
  linkedPositionRkeys,
  onPositionLinkChange,
  onSave,
  onCancel,
  isEditMode = false,
}: SkillEditDialogProps) {
  const t = useTranslations('editor');
  const [skillName, setSkillName] = useState(initialSkillName);
  const [category, setCategory] = useState(initialCategory);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSkillChange = (name: string, cat: string) => {
    setSkillName(name);
    // Auto-fill category from API suggestion if category is currently empty or unchanged
    if (cat && cat !== category) {
      setCategory(cat);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;
    setSaving(true);
    setError(null);
    const result = await onSave({ skillName: skillName.trim(), category });
    setSaving(false);
    if (!result.success) {
      setError(result.error ?? t('failedToSave'));
    }
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
          <div>
            <label htmlFor="edit-skillName" className="mb-1 block text-sm font-medium">
              Skill<span className="text-destructive"> *</span>
            </label>
            <SkillCombobox
              id="edit-skillName"
              value={skillName}
              category={category}
              onChange={handleSkillChange}
            />
          </div>

          <div>
            <label htmlFor="edit-category" className="mb-1 block text-sm font-medium">
              Category
            </label>
            <select
              id="edit-category"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {isEditMode && positions && onPositionLinkChange && (
            <PositionLinkList
              positions={positions}
              linkedPositionRkeys={linkedPositionRkeys ?? []}
              onToggle={onPositionLinkChange}
              disabled={saving}
            />
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={saving || !skillName.trim()}>
              {saving ? t('saving') : t('save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
