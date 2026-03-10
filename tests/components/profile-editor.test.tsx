import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SectionEditor, EditableEntry } from '@/components/profile-editor/section-editor';
import { EditDialog } from '@/components/profile-editor/edit-dialog';
import {
  POSITION_FIELDS,
  positionToValues,
  valuesToPosition,
} from '@/components/profile-editor/position-form';
import { ABOUT_FIELDS, profileToAboutValues } from '@/components/profile-editor/about-form';

describe('SectionEditor', () => {
  it('renders children without edit controls for non-owner', () => {
    render(
      <SectionEditor sectionTitle="Career">
        <p>Career content</p>
      </SectionEditor>,
    );
    expect(screen.getByText('Career content')).toBeDefined();
    expect(screen.queryByRole('button', { name: /add/i })).toBeNull();
  });

  it('shows add button for own profile', () => {
    const onAdd = vi.fn();
    render(
      <SectionEditor sectionTitle="Career" isOwnProfile onAdd={onAdd}>
        <p>Career content</p>
      </SectionEditor>,
    );
    expect(screen.getByRole('button', { name: 'Add Career' })).toBeDefined();
  });

  it('calls onAdd when add button clicked', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(
      <SectionEditor sectionTitle="Career" isOwnProfile onAdd={onAdd}>
        <p>Content</p>
      </SectionEditor>,
    );
    await user.click(screen.getByRole('button', { name: 'Add Career' }));
    expect(onAdd).toHaveBeenCalledOnce();
  });
});

describe('EditableEntry', () => {
  it('renders children without controls for non-owner', () => {
    render(
      <EditableEntry onEdit={vi.fn()} onDelete={vi.fn()} entryLabel="Engineer">
        <p>Entry</p>
      </EditableEntry>,
    );
    expect(screen.getByText('Entry')).toBeDefined();
    expect(screen.queryByRole('button', { name: /edit/i })).toBeNull();
  });

  it('shows edit and delete buttons for own profile', () => {
    render(
      <EditableEntry isOwnProfile onEdit={vi.fn()} onDelete={vi.fn()} entryLabel="Engineer">
        <p>Entry</p>
      </EditableEntry>,
    );
    expect(screen.getByRole('button', { name: 'Edit Engineer' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Delete Engineer' })).toBeDefined();
  });

  it('shows confirm on delete click', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <EditableEntry isOwnProfile onEdit={vi.fn()} onDelete={onDelete} entryLabel="Engineer">
        <p>Entry</p>
      </EditableEntry>,
    );
    await user.click(screen.getByRole('button', { name: 'Delete Engineer' }));
    const confirmBtn = screen.getByRole('button', { name: 'Confirm delete Engineer' });
    expect(confirmBtn).toBeDefined();
    await user.click(confirmBtn);
    expect(onDelete).toHaveBeenCalledOnce();
  });
});

describe('EditDialog', () => {
  it('renders form with fields', () => {
    render(
      <EditDialog
        title="Edit Position"
        fields={[{ name: 'title', label: 'Job Title', required: true }]}
        onSave={vi.fn().mockResolvedValue({ success: true })}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByRole('dialog', { name: 'Edit Position' })).toBeDefined();
    expect(screen.getByLabelText(/Job Title/)).toBeDefined();
  });

  it('calls onCancel when cancel clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <EditDialog
        title="Edit"
        fields={[{ name: 'x', label: 'X' }]}
        onSave={vi.fn().mockResolvedValue({ success: true })}
        onCancel={onCancel}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onSave with values on submit', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue({ success: true });
    render(
      <EditDialog
        title="Edit"
        fields={[{ name: 'title', label: 'Title' }]}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );
    await user.type(screen.getByLabelText('Title'), 'Engineer');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith({ title: 'Engineer' });
  });

  it('shows error message on failed save', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue({ success: false, error: 'Server error' });
    render(
      <EditDialog
        title="Edit"
        fields={[{ name: 'title', label: 'Title' }]}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('Server error')).toBeDefined();
  });

  it('populates initial values', () => {
    render(
      <EditDialog
        title="Edit"
        fields={[{ name: 'title', label: 'Title' }]}
        initialValues={{ title: 'Engineer' }}
        onSave={vi.fn().mockResolvedValue({ success: true })}
        onCancel={vi.fn()}
      />,
    );
    expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe('Engineer');
  });
});

describe('Position form helpers', () => {
  it('converts position to form values', () => {
    const values = positionToValues({
      rkey: '1',
      title: 'Engineer',
      companyName: 'Acme',
      startDate: '2020-01',
      current: true,
    });
    expect(values.title).toBe('Engineer');
    expect(values.companyName).toBe('Acme');
    expect(values.current).toBe(true);
  });

  it('converts form values to position', () => {
    const pos = valuesToPosition({
      title: 'Engineer',
      companyName: 'Acme',
      startDate: '2020-01',
      endDate: '',
      current: true,
      location: '',
      description: '',
    });
    expect(pos.title).toBe('Engineer');
    expect(pos.endDate).toBeUndefined();
    expect(pos.location).toBeUndefined();
  });

  it('has correct number of fields', () => {
    expect(POSITION_FIELDS.length).toBe(7);
  });
});

describe('About form helpers', () => {
  it('converts profile to about values', () => {
    const values = profileToAboutValues({
      headline: 'Dev',
      about: 'Hi',
      location: 'NL',
    });
    expect(values.headline).toBe('Dev');
    expect(values.website).toBe('');
  });

  it('has correct number of fields', () => {
    expect(ABOUT_FIELDS.length).toBe(4);
  });
});
