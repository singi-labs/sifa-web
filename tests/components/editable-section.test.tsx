import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableSection } from '@/components/profile-editor/editable-section';
import type { FieldDef } from '@/components/profile-editor/edit-dialog';

const mockAddItem = vi.fn();
const mockUpdateItem = vi.fn();
const mockRemoveItem = vi.fn();

vi.mock('@/components/profile-edit-provider', () => ({
  useProfileEdit: () => ({
    profile: {
      did: 'did:plc:test',
      handle: 'test.bsky.social',
      claimed: true,
      followersCount: 0,
      followingCount: 0,
      connectionsCount: 0,
      positions: [],
      education: [],
      skills: [
        { rkey: 'sk1', skillName: 'TypeScript', category: 'Frontend' },
        { rkey: 'sk2', skillName: 'Rust', category: 'Backend' },
      ],
    },
    addItem: mockAddItem,
    updateItem: mockUpdateItem,
    removeItem: mockRemoveItem,
    updateProfile: vi.fn(),
  }),
}));

vi.mock('@/lib/profile-api', () => ({
  createSkill: vi.fn().mockResolvedValue({ success: true, rkey: 'sk-new' }),
  updateSkill: vi.fn().mockResolvedValue({ success: true }),
  deleteSkill: vi.fn().mockResolvedValue({ success: true }),
  createRecord: vi.fn().mockResolvedValue({ success: true, rkey: 'r-new' }),
  updateRecord: vi.fn().mockResolvedValue({ success: true }),
  deleteRecord: vi.fn().mockResolvedValue({ success: true }),
  createPosition: vi.fn(),
  updatePosition: vi.fn(),
  deletePosition: vi.fn(),
  createEducation: vi.fn(),
  updateEducation: vi.fn(),
  deleteEducation: vi.fn(),
  createExternalAccount: vi.fn(),
  updateExternalAccount: vi.fn(),
  deleteExternalAccount: vi.fn(),
}));

interface TestSkill {
  rkey: string;
  skillName: string;
  category: string;
}

const SKILL_FIELDS: FieldDef[] = [
  { name: 'skillName', label: 'Skill Name', required: true },
  { name: 'category', label: 'Category' },
];

const toValues = (item: TestSkill): Record<string, string | boolean> => ({
  skillName: item.skillName,
  category: item.category ?? '',
});

const fromValues = (values: Record<string, string | boolean>): Omit<TestSkill, 'rkey'> => ({
  skillName: values.skillName as string,
  category: (values.category as string) || '',
});

const renderEntry = (item: TestSkill, controls?: { onEdit: () => void; onDelete: () => void }) => (
  <div>
    <span>{item.skillName}</span>
    {controls && (
      <>
        <button onClick={controls.onEdit} aria-label={`Edit ${item.skillName}`}>
          Edit
        </button>
        <button onClick={controls.onDelete} aria-label={`Delete ${item.skillName}`}>
          Delete
        </button>
      </>
    )}
  </div>
);

function renderSection(isOwnProfile = false) {
  return render(
    <EditableSection<TestSkill>
      sectionTitle="Skills"
      profileKey="skills"
      isOwnProfile={isOwnProfile}
      fields={SKILL_FIELDS}
      toValues={toValues}
      fromValues={fromValues}
      collection="id.sifa.profile.skill"
      renderEntry={renderEntry}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('EditableSection', () => {
  it('renders entries without edit controls when isOwnProfile is false', () => {
    renderSection(false);
    expect(screen.getByText('TypeScript')).toBeDefined();
    expect(screen.getByText('Rust')).toBeDefined();
    expect(screen.queryByRole('button', { name: /edit/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /delete/i })).toBeNull();
  });

  it('shows Add button when isOwnProfile is true', () => {
    renderSection(true);
    expect(screen.getByRole('button', { name: 'Add Skills' })).toBeDefined();
  });

  it('opens dialog on Add click', async () => {
    const user = userEvent.setup();
    renderSection(true);
    await user.click(screen.getByRole('button', { name: 'Add Skills' }));
    expect(screen.getByRole('dialog', { name: 'Add Skills' })).toBeDefined();
  });

  it('opens dialog on edit click with initial values', async () => {
    const user = userEvent.setup();
    renderSection(true);
    await user.click(screen.getByRole('button', { name: 'Edit TypeScript' }));
    expect(screen.getByRole('dialog', { name: 'Edit Skills' })).toBeDefined();
    expect((screen.getByLabelText(/Skill Name/) as HTMLInputElement).value).toBe('TypeScript');
  });

  it('delete calls removeItem on context', async () => {
    const user = userEvent.setup();
    renderSection(true);
    await user.click(screen.getByRole('button', { name: 'Delete TypeScript' }));
    // Wait for async delete to complete
    await vi.waitFor(() => {
      expect(mockRemoveItem).toHaveBeenCalledWith('skills', 'sk1');
    });
  });

  it('calls onPostSave after successful create', async () => {
    const user = userEvent.setup();
    const onPostSave = vi.fn();
    render(
      <EditableSection<TestSkill>
        sectionTitle="Skills"
        profileKey="skills"
        isOwnProfile
        fields={SKILL_FIELDS}
        toValues={toValues}
        fromValues={fromValues}
        collection="id.sifa.profile.skill"
        renderEntry={renderEntry}
        onPostSave={onPostSave}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Add Skills' }));
    await user.type(screen.getByLabelText(/Skill Name/), 'Go');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await vi.waitFor(() => {
      expect(onPostSave).toHaveBeenCalled();
    });
  });
});
