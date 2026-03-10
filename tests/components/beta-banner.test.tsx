import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BetaBanner } from '@/components/beta-banner';

describe('BetaBanner', () => {
  it('renders the beta message', () => {
    render(<BetaBanner />);

    expect(screen.getByRole('status')).toBeDefined();
    expect(screen.getByText(/Sifa is in beta/)).toBeDefined();
  });

  it('has a dismiss button', () => {
    render(<BetaBanner />);

    expect(screen.getByRole('button', { name: 'Dismiss banner' })).toBeDefined();
  });

  it('hides when dismissed', async () => {
    const user = userEvent.setup();
    render(<BetaBanner />);

    await user.click(screen.getByRole('button', { name: 'Dismiss banner' }));

    expect(screen.queryByRole('status')).toBeNull();
  });
});
