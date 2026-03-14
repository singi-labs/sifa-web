'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useProfileEdit } from '@/components/profile-edit-provider';
import { SectionEditor } from './section-editor';
import { EditDialog, type FieldDef } from './edit-dialog';
import {
  createPosition,
  updatePosition,
  deletePosition,
  createEducation,
  updateEducation,
  deleteEducation,
  createSkill,
  updateSkill,
  deleteSkill,
  createExternalAccount,
  updateExternalAccount,
  deleteExternalAccount,
  createRecord,
  updateRecord,
  deleteRecord,
  type CreateResult,
  type WriteResult,
} from '@/lib/profile-api';

interface NamedRoute {
  create: (data: Record<string, unknown>) => Promise<CreateResult>;
  update: (rkey: string, data: Record<string, unknown>) => Promise<WriteResult>;
  delete: (rkey: string) => Promise<WriteResult>;
}

const NAMED_ROUTES: Record<string, NamedRoute> = {
  'id.sifa.profile.position': {
    create: createPosition,
    update: updatePosition,
    delete: deletePosition,
  },
  'id.sifa.profile.education': {
    create: createEducation,
    update: updateEducation,
    delete: deleteEducation,
  },
  'id.sifa.profile.skill': { create: createSkill, update: updateSkill, delete: deleteSkill },
  'id.sifa.profile.externalAccount': {
    create: createExternalAccount as (data: Record<string, unknown>) => Promise<CreateResult>,
    update: updateExternalAccount as (
      rkey: string,
      data: Record<string, unknown>,
    ) => Promise<WriteResult>,
    delete: deleteExternalAccount,
  },
};

interface EditableSectionProps<T extends { rkey: string }> {
  sectionTitle: string;
  profileKey: string;
  isOwnProfile?: boolean;
  fields: FieldDef[];
  toValues: (item: T) => Record<string, string | boolean>;
  fromValues: (values: Record<string, string | boolean>) => Omit<T, 'rkey'>;
  collection: string;
  renderEntry: (
    item: T,
    editControls?: { onEdit: () => void; onDelete: () => void },
  ) => React.ReactNode;
  /** Called after a successful create or update. */
  onPostSave?: () => void;
  /** Called when any field value changes in the edit dialog. Return partial values to auto-fill. */
  onFieldChange?: (
    name: string,
    value: string | boolean,
    currentValues: Record<string, string | boolean>,
  ) => Record<string, string | boolean> | undefined;
}

type DialogState<T> = { mode: 'add' } | { mode: 'edit'; item: T };

export function EditableSection<T extends { rkey: string }>({
  sectionTitle,
  profileKey,
  isOwnProfile,
  fields,
  toValues,
  fromValues,
  collection,
  renderEntry,
  onPostSave,
  onFieldChange,
}: EditableSectionProps<T>) {
  const { profile, addItem, updateItem, removeItem } = useProfileEdit();
  const [dialog, setDialog] = useState<DialogState<T> | null>(null);

  const items = (profile[profileKey as keyof typeof profile] as T[] | undefined) ?? [];
  const routes = NAMED_ROUTES[collection];

  const handleSave = useCallback(
    async (
      values: Record<string, string | boolean>,
    ): Promise<{ success: boolean; error?: string }> => {
      const data = fromValues(values) as Record<string, unknown>;

      if (dialog?.mode === 'edit') {
        const result = routes
          ? await routes.update(dialog.item.rkey, data)
          : await updateRecord(collection, dialog.item.rkey, data);
        if (result.success) {
          updateItem(profileKey, dialog.item.rkey, data);
          setDialog(null);
          toast.success(`${sectionTitle} updated`);
          onPostSave?.();
        }
        return result;
      }

      // Add mode
      const result = routes ? await routes.create(data) : await createRecord(collection, data);
      if (result.success && result.rkey) {
        addItem(profileKey, { ...data, rkey: result.rkey } as Record<string, unknown> & {
          rkey: string;
        });
        setDialog(null);
        toast.success(`${sectionTitle} added`);
        onPostSave?.();
      }
      return result;
    },
    [
      dialog,
      routes,
      collection,
      fromValues,
      profileKey,
      sectionTitle,
      addItem,
      updateItem,
      onPostSave,
    ],
  );

  const handleDelete = useCallback(
    async (rkey: string) => {
      const result = routes ? await routes.delete(rkey) : await deleteRecord(collection, rkey);
      if (result.success) {
        removeItem(profileKey, rkey);
        toast.success(`${sectionTitle} removed`);
      } else {
        toast.error(result.error ?? 'Failed to delete');
      }
    },
    [routes, collection, profileKey, sectionTitle, removeItem],
  );

  return (
    <>
      <SectionEditor
        sectionTitle={sectionTitle}
        isOwnProfile={isOwnProfile}
        onAdd={() => setDialog({ mode: 'add' })}
      >
        {items.map((item) => {
          const controls = isOwnProfile
            ? {
                onEdit: () => setDialog({ mode: 'edit', item }),
                onDelete: () => handleDelete(item.rkey),
              }
            : undefined;
          return <div key={item.rkey}>{renderEntry(item, controls)}</div>;
        })}
      </SectionEditor>

      {dialog && (
        <EditDialog
          title={dialog.mode === 'add' ? `Add ${sectionTitle}` : `Edit ${sectionTitle}`}
          fields={fields}
          initialValues={dialog.mode === 'edit' ? toValues(dialog.item) : undefined}
          onSave={handleSave}
          onCancel={() => setDialog(null)}
          onFieldChange={onFieldChange}
        />
      )}
    </>
  );
}
