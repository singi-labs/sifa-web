import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { PositionLinkList } from '@/components/position-link-list';
import type { ProfilePosition } from '@/lib/types';

const positions: ProfilePosition[] = [
  {
    rkey: 'pos1',
    company: 'Stripe',
    title: 'Senior Engineer',
    startedAt: '2022-01',
  },
  {
    rkey: 'pos2',
    company: 'Acme',
    title: 'Software Developer',
    startedAt: '2019-06',
    endedAt: '2022-01',
  },
  {
    rkey: 'pos3',
    company: 'StartupCo',
    title: 'Junior Dev',
    startedAt: '2017-03',
    endedAt: '2019-06',
  },
];

describe('PositionLinkList', () => {
  it('renders positions list with checkboxes', () => {
    const onToggle = vi.fn();
    render(
      <PositionLinkList positions={positions} linkedPositionRkeys={['pos1']} onToggle={onToggle} />,
    );

    expect(screen.getByText('Used in')).toBeDefined();
    expect(screen.getByText('Senior Engineer at Stripe (2022 - Present)')).toBeDefined();
    expect(screen.getByText('Software Developer at Acme (2019 - 2022)')).toBeDefined();
    expect(screen.getByText('Junior Dev at StartupCo (2017 - 2019)')).toBeDefined();

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(false);
    expect((checkboxes[2] as HTMLInputElement).checked).toBe(false);
  });

  it('calls onToggle when checking a position', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<PositionLinkList positions={positions} linkedPositionRkeys={[]} onToggle={onToggle} />);

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]!);
    expect(onToggle).toHaveBeenCalledWith('pos1', true);
  });

  it('calls onToggle when unchecking a position', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <PositionLinkList positions={positions} linkedPositionRkeys={['pos2']} onToggle={onToggle} />,
    );

    // pos2 is linked so it sorts first
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]!);
    expect(onToggle).toHaveBeenCalledWith('pos2', false);
  });

  it('shows message when user has no positions', () => {
    const onToggle = vi.fn();
    render(<PositionLinkList positions={[]} linkedPositionRkeys={[]} onToggle={onToggle} />);

    expect(screen.getByText('Add positions to link skills to roles')).toBeDefined();
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  it('disables the fieldset when disabled prop is true', () => {
    const onToggle = vi.fn();
    const { container } = render(
      <PositionLinkList
        positions={positions}
        linkedPositionRkeys={[]}
        onToggle={onToggle}
        disabled
      />,
    );

    const fieldset = container.querySelector('fieldset');
    expect(fieldset).not.toBeNull();
    expect(fieldset!.disabled).toBe(true);
  });

  it('has accessible labels on checkboxes', () => {
    const onToggle = vi.fn();
    render(<PositionLinkList positions={positions} linkedPositionRkeys={[]} onToggle={onToggle} />);

    expect(screen.getByLabelText('Senior Engineer at Stripe (2022 - Present)')).toBeDefined();
    expect(screen.getByLabelText('Software Developer at Acme (2019 - 2022)')).toBeDefined();
  });

  it('sorts linked positions first, then by date descending', () => {
    const onToggle = vi.fn();
    render(
      <PositionLinkList positions={positions} linkedPositionRkeys={['pos3']} onToggle={onToggle} />,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    // pos3 is linked so it comes first despite being oldest
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
    expect(screen.getByLabelText('Junior Dev at StartupCo (2017 - 2019)')).toBeDefined();
  });

  it('shows filter input when 10+ positions exist', () => {
    const manyPositions: ProfilePosition[] = Array.from({ length: 12 }, (_, i) => ({
      rkey: `pos${i}`,
      company: `Company ${i}`,
      title: `Role ${i}`,
      startedAt: `${2010 + i}-01`,
    }));
    const onToggle = vi.fn();
    render(
      <PositionLinkList positions={manyPositions} linkedPositionRkeys={[]} onToggle={onToggle} />,
    );

    expect(screen.getByLabelText('Filter positions')).toBeDefined();
  });

  it('does not show filter input when fewer than 10 positions', () => {
    const onToggle = vi.fn();
    render(<PositionLinkList positions={positions} linkedPositionRkeys={[]} onToggle={onToggle} />);

    expect(screen.queryByLabelText('Filter positions')).toBeNull();
  });

  it('filters positions by title or company name', async () => {
    const user = userEvent.setup();
    const manyPositions: ProfilePosition[] = [
      ...Array.from({ length: 9 }, (_, i) => ({
        rkey: `filler${i}`,
        company: `Filler Co ${i}`,
        title: `Filler Role ${i}`,
        startedAt: `${2010 + i}-01`,
      })),
      {
        rkey: 'target',
        company: 'Stripe',
        title: 'Engineer',
        startedAt: '2023-01',
      },
    ];
    const onToggle = vi.fn();
    render(
      <PositionLinkList positions={manyPositions} linkedPositionRkeys={[]} onToggle={onToggle} />,
    );

    const filterInput = screen.getByLabelText('Filter positions');
    await user.type(filterInput, 'Stripe');

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(1);
    expect(screen.getByText('Engineer at Stripe (2023 - Present)')).toBeDefined();
  });

  it('shows empty message when filter matches nothing', async () => {
    const user = userEvent.setup();
    const manyPositions: ProfilePosition[] = Array.from({ length: 10 }, (_, i) => ({
      rkey: `pos${i}`,
      company: `Company ${i}`,
      title: `Role ${i}`,
      startedAt: `${2010 + i}-01`,
    }));
    const onToggle = vi.fn();
    render(
      <PositionLinkList positions={manyPositions} linkedPositionRkeys={[]} onToggle={onToggle} />,
    );

    await user.type(screen.getByLabelText('Filter positions'), 'zzzzz');
    expect(screen.getByText('No matching positions')).toBeDefined();
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  it('passes axe accessibility checks', async () => {
    const onToggle = vi.fn();
    const { container } = render(
      <PositionLinkList positions={positions} linkedPositionRkeys={['pos1']} onToggle={onToggle} />,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
