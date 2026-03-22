import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BetaBanner } from '@/components/beta-banner';

describe('BetaBanner', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('renders the pre-alpha message', () => {
    render(<BetaBanner />);

    expect(screen.getByRole('status')).toBeDefined();
    expect(screen.getByText(/Sifa is pre-alpha/)).toBeDefined();
  });

  it('has an info button and a dismiss button', () => {
    render(<BetaBanner />);

    expect(screen.getByRole('button', { name: 'What this means' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Dismiss banner' })).toBeDefined();
  });

  it('opens popover with details when info button is clicked', async () => {
    const user = userEvent.setup();
    render(<BetaBanner />);

    await user.click(screen.getByRole('button', { name: 'What this means' }));

    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByText(/live dev server/)).toBeDefined();
    expect(screen.getByText('Report issues on GitHub')).toBeDefined();
  });

  it('closes popover on Escape', async () => {
    const user = userEvent.setup();
    render(<BetaBanner />);

    await user.click(screen.getByRole('button', { name: 'What this means' }));
    expect(screen.getByRole('dialog')).toBeDefined();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('hides when dismissed', async () => {
    const user = userEvent.setup();
    render(<BetaBanner />);

    await user.click(screen.getByRole('button', { name: 'Dismiss banner' }));

    expect(screen.queryByRole('status')).toBeNull();
  });

  it('persists dismiss state in sessionStorage', async () => {
    const user = userEvent.setup();
    render(<BetaBanner />);

    await user.click(screen.getByRole('button', { name: 'Dismiss banner' }));

    expect(sessionStorage.getItem('sifa-beta-banner-dismissed')).toBe('true');
  });

  it('stays hidden when sessionStorage has dismiss flag', () => {
    sessionStorage.setItem('sifa-beta-banner-dismissed', 'true');

    render(<BetaBanner />);

    expect(screen.queryByRole('status')).toBeNull();
  });
});
