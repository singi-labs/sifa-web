import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { PositionEditDialog } from '@/components/position-edit-dialog';
import type { ProfilePosition, ProfileSkill } from '@/lib/types';

const mockCreateSkill = vi.fn();
const mockSearchSkills = vi.fn();

vi.mock('@/lib/profile-api', () => ({
  createSkill: (...args: unknown[]) => mockCreateSkill(...args),
  searchSkills: (...args: unknown[]) => mockSearchSkills(...args),
}));

const mockProfile = {
  did: 'did:plc:test123',
  handle: 'test.bsky.social',
  claimed: true,
  followersCount: 0,
  followingCount: 0,
  connectionsCount: 0,
  positions: [],
  education: [],
  skills: [
    { rkey: 'sk1', skillName: 'TypeScript', category: 'Technical' },
    { rkey: 'sk2', skillName: 'React', category: 'Frontend' },
  ] as ProfileSkill[],
};

vi.mock('@/components/profile-edit-provider', () => ({
  useProfileEdit: () => ({
    profile: mockProfile,
    updateProfile: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    editRequest: null,
    requestEdit: vi.fn(),
    clearEditRequest: vi.fn(),
  }),
}));

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  mockCreateSkill.mockReset();
  mockSearchSkills.mockReset().mockResolvedValue([]);
});

afterEach(() => {
  vi.useRealTimers();
});

const defaultProps = {
  title: 'Add Career',
  onSave: vi.fn().mockResolvedValue({ success: true }),
  onCancel: vi.fn(),
};

describe('PositionEditDialog', () => {
  it('renders all position fields and skill combobox', () => {
    render(<PositionEditDialog {...defaultProps} />);

    expect(screen.getByLabelText(/Job Title/)).toBeDefined();
    expect(screen.getByLabelText(/Company/)).toBeDefined();
    expect(screen.getByLabelText(/Start Date/)).toBeDefined();
    expect(screen.getByLabelText(/End Date/)).toBeDefined();
    expect(screen.getByLabelText(/I currently work here/)).toBeDefined();
    expect(screen.getByText(/Location/)).toBeDefined();
    expect(screen.getByLabelText(/Description/)).toBeDefined();
    expect(screen.getByLabelText(/Skills used/)).toBeDefined();
  });

  it('passes vitest-axe accessibility checks', async () => {
    // axe uses real async internals that hang under fake timers
    vi.useRealTimers();
    const { container } = render(<PositionEditDialog {...defaultProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15_000);

  it('populates fields when editing an existing position', () => {
    const position: ProfilePosition = {
      rkey: 'pos1',
      title: 'Senior Dev',
      companyName: 'Acme Corp',
      startDate: '2023-01',
      endDate: '2024-06',
      current: false,
      description: 'Built things',
      linkedSkills: [{ rkey: 'sk1', skillName: 'TypeScript', category: 'Technical' }],
      skills: [{ uri: 'at://did:plc:test123/id.sifa.profile.skill/sk1', cid: 'abc' }],
    };

    render(<PositionEditDialog {...defaultProps} title="Edit Career" position={position} />);

    expect((screen.getByLabelText(/Job Title/) as HTMLInputElement).value).toBe('Senior Dev');
    expect((screen.getByLabelText(/Company/) as HTMLInputElement).value).toBe('Acme Corp');
    // Linked skill chips should show
    expect(screen.getByText('TypeScript')).toBeDefined();
  });

  it('can add an existing profile skill as a linked skill chip', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockSearchSkills.mockResolvedValue([
      { canonicalName: 'TypeScript', slug: 'typescript', category: 'Technical' },
    ]);

    render(<PositionEditDialog {...defaultProps} />);

    const combobox = screen.getByRole('combobox', { name: /^Skills$/ });
    await user.type(combobox, 'TypeScript');

    await vi.advanceTimersByTimeAsync(350);
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeDefined();
    });

    // Click the suggestion to select it (scope to the skill listbox)
    const listbox = screen.getByRole('listbox');
    const options = within(listbox).getAllByRole('option');
    await user.click(options[0]!);

    // Should show as chip
    await waitFor(() => {
      const list = screen.getByRole('list', { name: /linked skills/i });
      expect(list).toBeDefined();
    });
  });

  it('can remove a linked skill chip', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const position: ProfilePosition = {
      rkey: 'pos1',
      title: 'Dev',
      companyName: 'Co',
      startDate: '2023-01',
      current: false,
      linkedSkills: [{ rkey: 'sk1', skillName: 'TypeScript', category: 'Technical' }],
      skills: [{ uri: 'at://did:plc:test123/id.sifa.profile.skill/sk1', cid: '' }],
    };

    render(<PositionEditDialog {...defaultProps} position={position} />);

    expect(screen.getByText('TypeScript')).toBeDefined();

    const removeBtn = screen.getByLabelText('Remove TypeScript');
    await user.click(removeBtn);

    await waitFor(() => {
      expect(screen.queryByLabelText('Remove TypeScript')).toBeNull();
    });
  });

  it('creates a new skill record when adding a non-existing skill', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockCreateSkill.mockResolvedValue({ success: true, rkey: 'sk-new' });
    mockSearchSkills.mockResolvedValue([
      { canonicalName: 'GraphQL', slug: 'graphql', category: 'Technical' },
    ]);

    render(<PositionEditDialog {...defaultProps} />);

    const combobox = screen.getByRole('combobox', { name: /^Skills$/ });
    await user.type(combobox, 'GraphQL');

    await vi.advanceTimersByTimeAsync(350);
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeDefined();
    });

    // Select from dropdown (scope to the skill listbox)
    const listbox = screen.getByRole('listbox');
    const options = within(listbox).getAllByRole('option');
    await user.click(options[0]!);

    await waitFor(() => {
      expect(mockCreateSkill).toHaveBeenCalledWith({
        skillName: 'GraphQL',
        category: 'Technical',
      });
    });

    // Should appear as a chip
    await waitFor(() => {
      expect(screen.getByRole('list', { name: /linked skills/i })).toBeDefined();
    });
  });

  it('calls onSave with position values and skill refs', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSave = vi.fn().mockResolvedValue({ success: true });

    render(<PositionEditDialog {...defaultProps} onSave={onSave} />);

    await user.type(screen.getByLabelText(/Job Title/), 'Engineer');
    await user.type(screen.getByLabelText(/Company/), 'Acme');
    await user.selectOptions(document.getElementById('edit-startDate')!, '01');
    await user.selectOptions(document.getElementById('edit-startDate-year')!, '2024');

    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
      const [values, skillRefs, linkedSkills, location] = onSave.mock.calls[0] as [
        Record<string, string | boolean>,
        unknown[],
        unknown[],
        unknown,
      ];
      expect(values.title).toBe('Engineer');
      expect(values.companyName).toBe('Acme');
      expect(Array.isArray(skillRefs)).toBe(true);
      expect(Array.isArray(linkedSkills)).toBe(true);
      expect(location).toBeNull();
    });
  });

  it('hides end date field when "I currently work here" is checked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PositionEditDialog {...defaultProps} />);

    // End Date visible by default
    expect(screen.getByLabelText(/End Date/)).toBeDefined();

    // Check "I currently work here"
    await user.click(screen.getByLabelText(/I currently work here/));

    // End Date should be hidden
    expect(screen.queryByLabelText(/End Date/)).toBeNull();

    // Uncheck — End Date should reappear
    await user.click(screen.getByLabelText(/I currently work here/));
    expect(screen.getByLabelText(/End Date/)).toBeDefined();
  });

  it('clears end date value when "I currently work here" is checked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSave = vi.fn().mockResolvedValue({ success: true });
    const position: ProfilePosition = {
      rkey: 'pos1',
      title: 'Dev',
      companyName: 'Co',
      startDate: '2023-01',
      endDate: '2024-06',
      current: false,
    };

    render(<PositionEditDialog {...defaultProps} onSave={onSave} position={position} />);

    // End date has values in the month/year selects
    expect((document.getElementById('edit-endDate') as HTMLSelectElement).value).toBe('06');
    expect((document.getElementById('edit-endDate-year') as HTMLSelectElement).value).toBe('2024');

    // Check "I currently work here"
    await user.click(screen.getByLabelText(/I currently work here/));

    // Save and verify endDate was cleared
    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
      const [values] = onSave.mock.calls[0] as [Record<string, string | boolean>];
      expect(values.endDate).toBe('');
      expect(values.current).toBe(true);
    });
  });

  it('does not add duplicate skills', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const position: ProfilePosition = {
      rkey: 'pos1',
      title: 'Dev',
      companyName: 'Co',
      startDate: '2023-01',
      current: false,
      linkedSkills: [{ rkey: 'sk1', skillName: 'TypeScript', category: 'Technical' }],
      skills: [{ uri: 'at://did:plc:test123/id.sifa.profile.skill/sk1', cid: '' }],
    };

    mockSearchSkills.mockResolvedValue([
      { canonicalName: 'TypeScript', slug: 'typescript', category: 'Technical' },
    ]);

    render(<PositionEditDialog {...defaultProps} position={position} />);

    const combobox = screen.getByRole('combobox', { name: /^Skills$/ });
    await user.type(combobox, 'TypeScript');
    await vi.advanceTimersByTimeAsync(350);
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeDefined();
    });

    const listbox = screen.getByRole('listbox');
    const options = within(listbox).getAllByRole('option');
    await user.click(options[0]!);

    // Should still have only one TypeScript chip
    await waitFor(() => {
      const removeButtons = screen.queryAllByLabelText('Remove TypeScript');
      expect(removeButtons.length).toBe(1);
    });
  });
});
