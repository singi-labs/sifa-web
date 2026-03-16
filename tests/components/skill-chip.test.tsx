import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { SkillChip } from '@/components/skill-chip';
import type { ProfileSkill } from '@/lib/types';

function makeSkill(overrides: Partial<ProfileSkill> = {}): ProfileSkill {
  return {
    rkey: 'abc123',
    skillName: 'TypeScript',
    ...overrides,
  };
}

describe('SkillChip', () => {
  it('renders skill name', () => {
    render(<SkillChip skill={makeSkill()} />);
    expect(screen.getByText('TypeScript')).toBeDefined();
  });

  it('renders plain badge for self-declared skills (no icons)', () => {
    const { container } = render(<SkillChip skill={makeSkill()} />);
    // No SVG icons should be present (except delete button if editing)
    expect(container.querySelectorAll('svg')).toHaveLength(0);
  });

  it('renders CheckCircle icon for endorsed skills', () => {
    render(<SkillChip skill={makeSkill({ endorsed: true })} />);
    const icon = screen.getByTestId('endorsed-icon');
    expect(icon).toBeDefined();
  });

  it('renders activity icon for activity-backed skills', () => {
    render(<SkillChip skill={makeSkill({ activityBacked: true })} />);
    const icon = screen.getByTestId('activity-backed-icon');
    expect(icon).toBeDefined();
  });

  it('prefers activity-backed over endorsed when both are true', () => {
    render(<SkillChip skill={makeSkill({ endorsed: true, activityBacked: true })} />);
    expect(screen.getByTestId('activity-backed-icon')).toBeDefined();
    expect(screen.queryByTestId('endorsed-icon')).toBeNull();
  });

  it('never displays endorsement count', () => {
    render(<SkillChip skill={makeSkill({ endorsementCount: 42, endorsed: true })} />);
    expect(screen.queryByText('42')).toBeNull();
  });

  it('shows tooltip on hover for endorsed skills', async () => {
    const user = userEvent.setup();
    render(<SkillChip skill={makeSkill({ endorsed: true })} />);
    const chip = screen.getByText('TypeScript').closest('[data-skill-chip]')!;
    await user.hover(chip);
    expect(screen.getByRole('tooltip', { name: /confirmed by people/i })).toBeDefined();
  });

  it('shows tooltip on focus for endorsed skills (keyboard accessible)', async () => {
    const user = userEvent.setup();
    render(<SkillChip skill={makeSkill({ endorsed: true })} />);
    await user.tab();
    expect(screen.getByRole('tooltip', { name: /confirmed by people/i })).toBeDefined();
  });

  it('shows tooltip on hover for activity-backed skills', async () => {
    const user = userEvent.setup();
    render(<SkillChip skill={makeSkill({ activityBacked: true })} />);
    const chip = screen.getByText('TypeScript').closest('[data-skill-chip]')!;
    await user.hover(chip);
    expect(screen.getByRole('tooltip', { name: /backed by verified activity/i })).toBeDefined();
  });

  it('does not show tooltip for self-declared skills', async () => {
    const user = userEvent.setup();
    render(<SkillChip skill={makeSkill()} />);
    const chip = screen.getByText('TypeScript').closest('[data-skill-chip]')!;
    await user.hover(chip);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('shows category when showCategory is true', () => {
    render(<SkillChip skill={makeSkill({ category: 'Programming' })} showCategory />);
    expect(screen.getByText(/Programming/)).toBeDefined();
  });

  it('shows delete button when editable with onDelete', () => {
    const onDelete = vi.fn();
    render(<SkillChip skill={makeSkill()} editable onDelete={onDelete} />);
    expect(screen.getByRole('button', { name: /remove typescript/i })).toBeDefined();
  });

  it('does not show delete button when not editable', () => {
    const onDelete = vi.fn();
    render(<SkillChip skill={makeSkill()} onDelete={onDelete} />);
    expect(screen.queryByRole('button', { name: /remove typescript/i })).toBeNull();
  });

  it('calls onEdit when clicked in editable mode', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<SkillChip skill={makeSkill()} editable onEdit={onEdit} />);
    await user.click(screen.getByText('TypeScript'));
    expect(onEdit).toHaveBeenCalledOnce();
  });

  it('passes axe accessibility audit', async () => {
    const { container } = render(
      <div>
        <SkillChip skill={makeSkill()} />
        <SkillChip skill={makeSkill({ endorsed: true, skillName: 'React', rkey: 'r1' })} />
        <SkillChip skill={makeSkill({ activityBacked: true, skillName: 'Node.js', rkey: 'r2' })} />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
