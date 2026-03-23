import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { ActiveApp } from '@/lib/types';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    if (key === 'activeOn') return `Active on ${values?.app}`;
    if (key === 'moreApps') return `+${values?.count} more`;
    if (key === 'label') return 'Active apps';
    return key;
  },
}));

const mockApps: ActiveApp[] = [
  { id: 'bluesky', name: 'Bluesky network', category: 'social', recentCount: 42 },
  { id: 'tangled', name: 'Tangled', category: 'dev', recentCount: 15 },
  { id: 'whitewind', name: 'Whitewind', category: 'blog', recentCount: 8 },
];

const manyApps: ActiveApp[] = [
  { id: 'bluesky', name: 'Bluesky network', category: 'social', recentCount: 42 },
  { id: 'tangled', name: 'Tangled', category: 'dev', recentCount: 15 },
  { id: 'whitewind', name: 'Whitewind', category: 'blog', recentCount: 8 },
  { id: 'frontpage', name: 'Frontpage', category: 'social', recentCount: 5 },
  { id: 'smokesignal', name: 'AT Protocol events', category: 'events', recentCount: 3 },
  { id: 'picosky', name: 'Picosky', category: 'social', recentCount: 2 },
  { id: 'linkat', name: 'Linkat', category: 'links', recentCount: 1 },
];

describe('ActivityIndicators', () => {
  // Lazy import so the mock is in place before module loads
  async function loadComponent() {
    const mod = await import('./activity-indicators');
    return mod.ActivityIndicators;
  }

  it('renders pills for each active app', async () => {
    const ActivityIndicators = await loadComponent();
    render(<ActivityIndicators apps={mockApps} />);

    expect(screen.getByText('Bluesky network')).toBeDefined();
    expect(screen.getByText('Tangled')).toBeDefined();
    expect(screen.getByText('Whitewind')).toBeDefined();
  });

  it('renders nothing when apps is empty', async () => {
    const ActivityIndicators = await loadComponent();
    const { container } = render(<ActivityIndicators apps={[]} />);

    expect(container.innerHTML).toBe('');
  });

  it('does not show counts in pills', async () => {
    const ActivityIndicators = await loadComponent();
    render(<ActivityIndicators apps={mockApps} />);

    expect(screen.queryByText('42')).toBeNull();
    expect(screen.queryByText('15')).toBeNull();
    expect(screen.queryByText('8')).toBeNull();
  });

  it('has accessible labels on pills', async () => {
    const ActivityIndicators = await loadComponent();
    render(<ActivityIndicators apps={mockApps} />);

    expect(screen.getByLabelText('Active on Bluesky network')).toBeDefined();
    expect(screen.getByLabelText('Active on Tangled')).toBeDefined();
    expect(screen.getByLabelText('Active on Whitewind')).toBeDefined();
  });

  it('shows overflow button when more than maxVisible apps', async () => {
    const ActivityIndicators = await loadComponent();
    render(<ActivityIndicators apps={manyApps} maxVisible={5} />);

    const moreButton = screen.getByRole('button', { name: /\+2 more/i });
    expect(moreButton).toBeDefined();
    expect(moreButton.getAttribute('aria-expanded')).toBe('false');
  });

  it('expands overflow on click', async () => {
    const user = userEvent.setup();
    const ActivityIndicators = await loadComponent();
    render(<ActivityIndicators apps={manyApps} maxVisible={5} />);

    // Before expand: overflow apps should not be visible
    expect(screen.queryByText('Picosky')).toBeNull();
    expect(screen.queryByText('Linkat')).toBeNull();

    const moreButton = screen.getByRole('button', { name: /\+2 more/i });
    await user.click(moreButton);

    // After expand: all apps visible
    expect(screen.getByText('Picosky')).toBeDefined();
    expect(screen.getByText('Linkat')).toBeDefined();
  });

  it('calls onFilter when a pill is clicked', async () => {
    const user = userEvent.setup();
    const onFilter = vi.fn();
    const ActivityIndicators = await loadComponent();
    render(<ActivityIndicators apps={mockApps} onFilter={onFilter} />);

    await user.click(screen.getByLabelText('Active on Bluesky network'));
    expect(onFilter).toHaveBeenCalledWith('bluesky');
  });

  it('toggles filter off when active pill is clicked again', async () => {
    const user = userEvent.setup();
    const onFilter = vi.fn();
    const ActivityIndicators = await loadComponent();
    render(<ActivityIndicators apps={mockApps} activeFilter="bluesky" onFilter={onFilter} />);

    await user.click(screen.getByLabelText('Active on Bluesky network'));
    expect(onFilter).toHaveBeenCalledWith(null);
  });

  it('sets aria-pressed on active filter pill', async () => {
    const onFilter = vi.fn();
    const ActivityIndicators = await loadComponent();
    render(<ActivityIndicators apps={mockApps} activeFilter="bluesky" onFilter={onFilter} />);

    const blueskyPill = screen.getByLabelText('Active on Bluesky network');
    expect(blueskyPill.getAttribute('aria-pressed')).toBe('true');

    const tangledPill = screen.getByLabelText('Active on Tangled');
    expect(tangledPill.getAttribute('aria-pressed')).toBe('false');
  });

  it('renders spans (not buttons) when onFilter is not provided', async () => {
    const ActivityIndicators = await loadComponent();
    render(<ActivityIndicators apps={mockApps} />);

    const blueskyPill = screen.getByLabelText('Active on Bluesky network');
    expect(blueskyPill.tagName).toBe('SPAN');

    // No buttons for pills (only possible overflow button if needed)
    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(0);
  });
});
