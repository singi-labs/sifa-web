import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

/**
 * Mock Base UI Menu to render inline (no portals, no pointer-event gating).
 * This lets us verify that click handlers are correctly wired to menu items,
 * catching wrong-prop-name bugs like `onSelect` vs `onClick`.
 */
vi.mock('@base-ui/react/menu', () => ({
  Menu: {
    Root: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Trigger: ({ children, ...props }: Record<string, unknown>) => (
      <button type="button" {...props}>
        {children as ReactNode}
      </button>
    ),
    Portal: ({ children }: { children: ReactNode }) => <>{children}</>,
    Positioner: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Popup: ({ children }: { children: ReactNode }) => (
      <div role="menu">{children as ReactNode}</div>
    ),
    Item: ({ children, ...props }: Record<string, unknown>) => (
      <div role="menuitem" {...props}>
        {children as ReactNode}
      </div>
    ),
  },
}));

import { EditableEntry } from '@/components/profile-editor/section-editor';

describe('EditableEntry menu actions', () => {
  it('fires onEdit when Edit menu item is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(
      <EditableEntry isOwnProfile onEdit={onEdit} onDelete={vi.fn()} entryLabel="Engineer">
        <p>Entry</p>
      </EditableEntry>,
    );
    const editItem = screen.getByRole('menuitem', { name: /edit/i });
    await user.click(editItem);
    expect(onEdit).toHaveBeenCalledOnce();
  });

  it('fires onDelete when Delete menu item is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <EditableEntry isOwnProfile onEdit={vi.fn()} onDelete={onDelete} entryLabel="Engineer">
        <p>Entry</p>
      </EditableEntry>,
    );
    const deleteItem = screen.getByRole('menuitem', { name: /delete/i });
    await user.click(deleteItem);
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('does not fire callbacks without clicking', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(
      <EditableEntry isOwnProfile onEdit={onEdit} onDelete={onDelete} entryLabel="Engineer">
        <p>Entry</p>
      </EditableEntry>,
    );
    expect(onEdit).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });
});
