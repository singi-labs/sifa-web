import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkillEditDialog } from '@/components/skill-edit-dialog';
import type { ProfilePosition } from '@/lib/types';

// Mock the SkillCombobox to avoid search API calls
vi.mock('@/components/skill-combobox', () => ({
  SkillCombobox: ({
    id,
    value,
    onChange,
  }: {
    id: string;
    value: string;
    category: string;
    onChange: (name: string, cat: string) => void;
  }) => (
    <input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value, '')}
      data-testid="skill-combobox"
    />
  ),
}));

const positions: ProfilePosition[] = [
  {
    rkey: 'pos1',
    companyName: 'Stripe',
    title: 'Senior Engineer',
    startDate: '2022-01',
    current: true,
  },
  {
    rkey: 'pos2',
    companyName: 'Acme',
    title: 'Developer',
    startDate: '2019-06',
    endDate: '2022-01',
    current: false,
  },
];

describe('SkillEditDialog — Used in positions', () => {
  it('shows "Used in" section when editing an existing skill', () => {
    render(
      <SkillEditDialog
        title="Edit Skills"
        initialSkillName="TypeScript"
        isEditMode
        positions={positions}
        linkedPositionRkeys={['pos1']}
        onPositionLinkChange={vi.fn()}
        onSave={vi.fn().mockResolvedValue({ success: true })}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText('Used in')).toBeDefined();
    expect(
      screen.getByText('Senior Engineer at Stripe (2022 - Present)'),
    ).toBeDefined();
    expect(
      screen.getByText('Developer at Acme (2019 - 2022)'),
    ).toBeDefined();

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(false);
  });

  it('does not show "Used in" section when adding a new skill', () => {
    render(
      <SkillEditDialog
        title="Add Skills"
        isEditMode={false}
        positions={positions}
        linkedPositionRkeys={[]}
        onPositionLinkChange={vi.fn()}
        onSave={vi.fn().mockResolvedValue({ success: true })}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.queryByText('Used in')).toBeNull();
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  it('does not show "Used in" section when positions prop is omitted', () => {
    render(
      <SkillEditDialog
        title="Edit Skills"
        initialSkillName="TypeScript"
        isEditMode
        onSave={vi.fn().mockResolvedValue({ success: true })}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.queryByText('Used in')).toBeNull();
  });

  it('calls onPositionLinkChange when toggling a position checkbox', async () => {
    const user = userEvent.setup();
    const onPositionLinkChange = vi.fn();

    render(
      <SkillEditDialog
        title="Edit Skills"
        initialSkillName="TypeScript"
        isEditMode
        positions={positions}
        linkedPositionRkeys={[]}
        onPositionLinkChange={onPositionLinkChange}
        onSave={vi.fn().mockResolvedValue({ success: true })}
        onCancel={vi.fn()}
      />,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]!);
    expect(onPositionLinkChange).toHaveBeenCalledWith('pos1', true);
  });

  it('shows empty state message when positions array is empty', () => {
    render(
      <SkillEditDialog
        title="Edit Skills"
        initialSkillName="TypeScript"
        isEditMode
        positions={[]}
        linkedPositionRkeys={[]}
        onPositionLinkChange={vi.fn()}
        onSave={vi.fn().mockResolvedValue({ success: true })}
        onCancel={vi.fn()}
      />,
    );

    expect(
      screen.getByText('Add positions to link skills to roles'),
    ).toBeDefined();
  });
});
