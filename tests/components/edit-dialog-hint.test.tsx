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
      { value: 'website', label: 'Website' },
    ],
  },
  { name: 'url', label: 'URL', type: 'url', required: true },
  {
    name: 'verifyHintGithub',
    label: 'Verification',
    type: 'hint',
    description: 'Add your Sifa profile URL as the Website or as a Social account.',
    hintUrl: 'https://sifa.id/p/testuser',
    visibleWhen: (values) => values.platform === 'github',
  },
  {
    name: 'verifyHintWebsite',
    label: 'Verification',
    type: 'hint',
    description: "Add the following tag to your site's head section.",
    hintUrl: 'https://sifa.id/p/testuser',
    hintSnippet: '<link rel="me" href="https://sifa.id/p/testuser">',
    visibleWhen: (values) => values.platform === 'website',
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
    expect(screen.getByText(/Add your Sifa profile URL/)).toBeDefined();
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
    expect(screen.queryByText(/Add your Sifa profile URL/)).toBeNull();
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
    expect(screen.queryByText(/Add your Sifa profile URL/)).toBeNull();
    await user.selectOptions(screen.getByRole('combobox'), 'github');
    expect(screen.getByText(/Add your Sifa profile URL/)).toBeDefined();
  });

  it('renders clickable profile URL link for github hint', () => {
    render(
      <EditDialog
        title="Add Link"
        fields={fields}
        initialValues={{ platform: 'github', url: '' }}
        onSave={vi.fn().mockResolvedValue({ success: true })}
        onCancel={vi.fn()}
      />,
    );
    const link = screen.getByRole('link', { name: 'https://sifa.id/p/testuser' });
    expect(link.getAttribute('href')).toBe('https://sifa.id/p/testuser');
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('renders code snippet for website hint instead of link', () => {
    render(
      <EditDialog
        title="Add Link"
        fields={fields}
        initialValues={{ platform: 'website', url: '' }}
        onSave={vi.fn().mockResolvedValue({ success: true })}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText('<link rel="me" href="https://sifa.id/p/testuser">')).toBeDefined();
    // Should not render as a clickable link
    expect(screen.queryByRole('link', { name: /sifa.id/ })).toBeNull();
  });

  it('renders copy button in hint', () => {
    render(
      <EditDialog
        title="Add Link"
        fields={fields}
        initialValues={{ platform: 'github', url: '' }}
        onSave={vi.fn().mockResolvedValue({ success: true })}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Copy profile URL' })).toBeDefined();
  });
});
