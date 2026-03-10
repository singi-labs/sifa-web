import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TrustStatsHints } from '@/components/trust-stats-hints';

describe('TrustStatsHints', () => {
  it('renders hints for own profile with zero stats', () => {
    render(<TrustStatsHints isOwnProfile trustStats={[]} />);
    expect(screen.getByText('Grow your track record')).toBeDefined();
  });

  it('hides for non-owners', () => {
    const { container } = render(<TrustStatsHints trustStats={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('hides when all stats above zero', () => {
    const { container } = render(
      <TrustStatsHints
        isOwnProfile
        trustStats={[
          { key: 'connections', label: 'Connections', value: 5 },
          { key: 'endorsements', label: 'Endorsements', value: 3 },
          { key: 'reactions', label: 'Reactions', value: 1 },
        ]}
      />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('can be dismissed', async () => {
    const user = userEvent.setup();
    render(<TrustStatsHints isOwnProfile trustStats={[]} />);
    expect(screen.getByText('Grow your track record')).toBeDefined();
    await user.click(screen.getByRole('button', { name: 'Dismiss hints' }));
    expect(screen.queryByText('Grow your track record')).toBeNull();
  });
});
