import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditDialog, type FieldDef } from '@/components/profile-editor/edit-dialog';

const fields: FieldDef[] = [
  {
    name: 'platform',
    label: 'Platform',
    type: 'select',
    required: true,
    options: [
      { value: 'github', label: 'GitHub' },
      { value: 'youtube', label: 'YouTube' },
    ],
  },
  { name: 'url', label: 'URL', type: 'url', required: true },
  {
    name: 'verificationHint',
    label: 'Verification',
    type: 'hint',
    description: 'Add your profile URL to GitHub.',
    visibleWhen: (values) => values.platform === 'github',
  },
];

describe('EditDialog hint field', () => {
  it('renders hint text when visibleWhen is true', () => {
    render(
      <EditDialog
        title="Add Link"
        fields={fields}
        initialValues={{ platform: 'github', url: '' }}
        onSave={vi.fn().mockResolvedValue({ success: true })}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText('Add your profile URL to GitHub.')).toBeDefined();
  });

  it('hides hint when visibleWhen is false', () => {
    render(
      <EditDialog
        title="Add Link"
        fields={fields}
        initialValues={{ platform: 'youtube', url: '' }}
        onSave={vi.fn().mockResolvedValue({ success: true })}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.queryByText('Add your profile URL to GitHub.')).toBeNull();
  });

  it('hint does not render an input element', () => {
    render(
      <EditDialog
        title="Add Link"
        fields={fields}
        initialValues={{ platform: 'github', url: '' }}
        onSave={vi.fn().mockResolvedValue({ success: true })}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText('Verification')).toBeNull();
  });

  it('hint appears when platform changes to verifiable', async () => {
    const user = userEvent.setup();
    render(
      <EditDialog
        title="Add Link"
        fields={fields}
        initialValues={{ platform: '', url: '' }}
        onSave={vi.fn().mockResolvedValue({ success: true })}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.queryByText('Add your profile URL to GitHub.')).toBeNull();
    await user.selectOptions(screen.getByRole('combobox'), 'github');
    expect(screen.getByText('Add your profile URL to GitHub.')).toBeDefined();
  });
});
