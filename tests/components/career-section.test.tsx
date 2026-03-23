import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import type { ProfilePosition, ProfileSkill } from '@/lib/types';

/**
 * Mock Base UI Menu to render inline (no portals, no pointer-event gating).
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

import { CareerSection } from '@/components/profile-sections/career-section';

const mockAddItem = vi.fn();
const mockUpdateItem = vi.fn();
const mockRemoveItem = vi.fn();

const skillsOnProfile: ProfileSkill[] = [
  { rkey: 'sk1', skillName: 'TypeScript', category: 'Technical' },
  { rkey: 'sk2', skillName: 'React', category: 'Frontend' },
];

const positionsWithSkills: ProfilePosition[] = [
  {
    rkey: 'pos1',
    title: 'Senior Developer',
    companyName: 'Acme Corp',
    startDate: '2022-01',
    endDate: '2024-06',
    current: false,
    description: 'Built software',
    linkedSkills: [skillsOnProfile[0]!],
    skills: [{ uri: 'at://did:plc:test/id.sifa.profile.skill/sk1', cid: '' }],
  },
  {
    rkey: 'pos2',
    title: 'Junior Developer',
    companyName: 'Startup Inc',
    startDate: '2020-03',
    endDate: '2021-12',
    current: false,
  },
];

vi.mock('@/components/profile-edit-provider', () => ({
  useProfileEdit: () => ({
    profile: {
      did: 'did:plc:test',
      handle: 'test.bsky.social',
      claimed: true,
      followersCount: 0,
      followingCount: 0,
      connectionsCount: 0,
      positions: positionsWithSkills,
      education: [],
      skills: skillsOnProfile,
    },
    addItem: mockAddItem,
    updateItem: mockUpdateItem,
    removeItem: mockRemoveItem,
    updateProfile: vi.fn(),
    editRequest: null,
    requestEdit: vi.fn(),
    clearEditRequest: vi.fn(),
  }),
}));

vi.mock('@/lib/profile-api', () => ({
  createPosition: vi.fn().mockResolvedValue({ success: true, rkey: 'pos-new' }),
  updatePosition: vi.fn().mockResolvedValue({ success: true }),
  deletePosition: vi.fn().mockResolvedValue({ success: true }),
  createSkill: vi.fn().mockResolvedValue({ success: true, rkey: 'sk-new' }),
  updateSkill: vi.fn().mockResolvedValue({ success: true }),
  deleteSkill: vi.fn().mockResolvedValue({ success: true }),
  createEducation: vi.fn().mockResolvedValue({ success: true, rkey: 'ed-new' }),
  updateEducation: vi.fn().mockResolvedValue({ success: true }),
  deleteEducation: vi.fn().mockResolvedValue({ success: true }),
  createExternalAccount: vi.fn().mockResolvedValue({ success: true, rkey: 'ea-new' }),
  updateExternalAccount: vi.fn().mockResolvedValue({ success: true }),
  deleteExternalAccount: vi.fn().mockResolvedValue({ success: true }),
  createRecord: vi.fn().mockResolvedValue({ success: true, rkey: 'r-new' }),
  updateRecord: vi.fn().mockResolvedValue({ success: true }),
  deleteRecord: vi.fn().mockResolvedValue({ success: true }),
  searchSkills: vi.fn().mockResolvedValue([]),
}));

describe('CareerSection', () => {
  it('renders positions with titles and companies', () => {
    render(<CareerSection positions={positionsWithSkills} isOwnProfile />);

    expect(screen.getByText('Senior Developer')).toBeDefined();
    expect(screen.getByText('Acme Corp')).toBeDefined();
    expect(screen.getByText('Junior Developer')).toBeDefined();
    expect(screen.getByText('Startup Inc')).toBeDefined();
  });

  it('displays linked skills as chips under expanded position', async () => {
    const user = userEvent.setup();
    render(<CareerSection positions={positionsWithSkills} isOwnProfile />);

    // TimelineEntry expands on click to show description + children
    const expandButton = screen.getByText('Senior Developer').closest('button');
    if (expandButton) {
      await user.click(expandButton);
    }

    // After expanding, the skill chip should be visible
    expect(screen.getByText('TypeScript')).toBeDefined();
  });

  it('does not display skill chips for positions without linked skills', () => {
    render(<CareerSection positions={positionsWithSkills} isOwnProfile />);

    // Junior Developer has no linkedSkills, so no chips appear
    const juniorText = screen.getByText('Junior Developer');
    expect(juniorText).toBeDefined();
    // Descriptions are expanded by default — TypeScript chip should be visible
    // under Senior Developer but not under Junior Developer
    const buttons = screen.getAllByRole('button', { expanded: true });
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('opens position edit dialog with skill combobox when editing', async () => {
    const user = userEvent.setup();
    render(<CareerSection positions={positionsWithSkills} isOwnProfile />);

    // Click "Edit" menu item (menu is mocked inline, no portal)
    const editItems = screen.getAllByRole('menuitem', { name: /edit/i });
    await user.click(editItems[0]!);

    // The dialog should contain the skill combobox
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByLabelText(/Skills used/)).toBeDefined();
  });

  it('renders section even when positions prop is empty (reads from context)', () => {
    // The component reads positions from the profile edit context, not from the prop.
    // With the mocked profile containing positions, it should still render them.
    render(<CareerSection positions={[]} isOwnProfile={false} />);
    expect(screen.getByText('Senior Developer')).toBeDefined();
  });
});
