'use client';

import { useState } from 'react';
import { PencilSimple, Plus, Trash } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

interface SectionEditorProps {
  isOwnProfile?: boolean;
  sectionTitle: string;
  onAdd?: () => void;
  children: React.ReactNode;
}

export function SectionEditor({ isOwnProfile, sectionTitle, onAdd, children }: SectionEditorProps) {
  if (!isOwnProfile) return <>{children}</>;

  return (
    <div className="group relative">
      {children}
      {onAdd && (
        <div className="mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAdd}
            aria-label={`Add ${sectionTitle}`}
          >
            <Plus className="mr-1 h-4 w-4" weight="bold" aria-hidden="true" />
            Add
          </Button>
        </div>
      )}
    </div>
  );
}

interface EditableEntryProps {
  isOwnProfile?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  entryLabel: string;
  children: React.ReactNode;
}

export function EditableEntry({
  isOwnProfile,
  onEdit,
  onDelete,
  entryLabel,
  children,
}: EditableEntryProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOwnProfile) return <>{children}</>;

  return (
    <div className="group/entry relative">
      {children}
      <div className="absolute -right-2 top-0 flex gap-1 opacity-0 transition-opacity group-hover/entry:opacity-100 focus-within:opacity-100">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={onEdit}
          aria-label={`Edit ${entryLabel}`}
        >
          <PencilSimple className="h-3.5 w-3.5" weight="bold" aria-hidden="true" />
        </Button>
        {confirmDelete ? (
          <Button
            variant="destructive"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => {
              onDelete();
              setConfirmDelete(false);
            }}
            onBlur={() => setConfirmDelete(false)}
            aria-label={`Confirm delete ${entryLabel}`}
          >
            Confirm
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive"
            onClick={() => setConfirmDelete(true)}
            aria-label={`Delete ${entryLabel}`}
          >
            <Trash className="h-3.5 w-3.5" weight="bold" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
