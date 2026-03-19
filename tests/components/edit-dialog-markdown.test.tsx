import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EditDialog, type FieldDef } from '@/components/profile-editor/edit-dialog';

const markdownFields: FieldDef[] = [
  {
    name: 'about',
    label: 'About',
    type: 'markdown',
    placeholder: 'Tell your story...',
  },
];

describe('EditDialog with markdown field', () => {
  it('renders PlateMarkdownEditor for markdown type', async () => {
    render(
      <EditDialog
        title="Edit About"
        fields={markdownFields}
        onSave={vi.fn().mockResolvedValue({ success: true })}
        onCancel={vi.fn()}
      />,
    );

    // The label should be rendered
    expect(screen.getByText('About')).toBeDefined();

    // The toolbar should render (from the lazy-loaded PlateMarkdownEditor)
    // Use findBy for async (Suspense lazy load)
    const toolbar = await screen.findByRole('toolbar', { name: 'Text formatting' });
    expect(toolbar).toBeDefined();
  });
});
