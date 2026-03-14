'use client';

import { DotsThreeVertical, PencilSimple, Plus, Trash } from '@phosphor-icons/react';
import { Menu } from '@base-ui/react/menu';
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
          <Button variant="ghost" size="sm" onClick={onAdd} aria-label={`Add ${sectionTitle}`}>
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
  /** Optional content (e.g. star toggle) to render before the kebab menu */
  trailingContent?: React.ReactNode;
}

export function EditableEntry({
  isOwnProfile,
  onEdit,
  onDelete,
  entryLabel,
  children,
  trailingContent,
}: EditableEntryProps) {
  if (!isOwnProfile) return <>{children}</>;

  return (
    <div className="flex items-start gap-2">
      <div className="min-w-0 flex-1">{children}</div>
      {trailingContent}
      <Menu.Root>
        <Menu.Trigger
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`${entryLabel} options`}
        >
          <DotsThreeVertical className="h-4 w-4" weight="bold" aria-hidden="true" />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner align="end" sideOffset={4}>
            <Menu.Popup className="z-[60] min-w-[140px] rounded-md border border-border bg-card py-1 shadow-md">
              <Menu.Item
                className="flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-foreground outline-none hover:bg-accent focus:bg-accent"
                onClick={onEdit}
              >
                <PencilSimple className="h-3.5 w-3.5" weight="bold" aria-hidden="true" />
                Edit
              </Menu.Item>
              <Menu.Item
                className="flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-destructive outline-none hover:bg-destructive/10 focus:bg-destructive/10"
                onClick={onDelete}
              >
                <Trash className="h-3.5 w-3.5" weight="bold" aria-hidden="true" />
                Delete
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </div>
  );
}
