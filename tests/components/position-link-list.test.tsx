import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { PositionLinkList } from '@/components/position-link-list';
import type { ProfilePosition } from '@/lib/types';

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
    title: 'Software Developer',
    startDate: '2019-06',
    endDate: '2022-01',
    current: false,
  },
  {
    rkey: 'pos3',
    companyName: 'StartupCo',
    title: 'Junior Dev',
    startDate: '2017-03',
    endDate: '2019-06',
    current: false,
  },
];

describe('PositionLinkList', () => {
  it('renders positions list with checkboxes', () => {
    const onToggle = vi.fn();
    render(
      <PositionLinkList
        positions={positions}
        linkedPositionRkeys={['pos1']}
        onToggle={onToggle}
      />,
    );

    expect(screen.getByText('Used in')).toBeDefined();
    expect(
      screen.getByText('Senior Engineer at Stripe (2022 - Present)'),
    ).toBeDefined();
    expect(
      screen.getByText('Software Developer at Acme (2019 - 2022)'),
    ).toBeDefined();
    expect(
      screen.getByText('Junior Dev at StartupCo (2017 - 2019)'),
    ).toBeDefined();

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(false);
    expect((checkboxes[2] as HTMLInputElement).checked).toBe(false);
  });

  it('calls onToggle when checking a position', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <PositionLinkList
        positions={positions}
        linkedPositionRkeys={[]}
        onToggle={onToggle}
      />,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]!);
    expect(onToggle).toHaveBeenCalledWith('pos1', true);
  });

  it('calls onToggle when unchecking a position', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <PositionLinkList
        positions={positions}
        linkedPositionRkeys={['pos2']}
        onToggle={onToggle}
      />,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]!);
    expect(onToggle).toHaveBeenCalledWith('pos2', false);
  });

  it('shows message when user has no positions', () => {
    const onToggle = vi.fn();
    render(
      <PositionLinkList
        positions={[]}
        linkedPositionRkeys={[]}
        onToggle={onToggle}
      />,
    );

    expect(
      screen.getByText('Add positions to link skills to roles'),
    ).toBeDefined();
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
    render(
      <PositionLinkList
        positions={positions}
        linkedPositionRkeys={[]}
        onToggle={onToggle}
      />,
    );

    expect(
      screen.getByLabelText('Senior Engineer at Stripe (2022 - Present)'),
    ).toBeDefined();
    expect(
      screen.getByLabelText('Software Developer at Acme (2019 - 2022)'),
    ).toBeDefined();
  });

  it('passes axe accessibility checks', async () => {
    const onToggle = vi.fn();
    const { container } = render(
      <PositionLinkList
        positions={positions}
        linkedPositionRkeys={['pos1']}
        onToggle={onToggle}
      />,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
