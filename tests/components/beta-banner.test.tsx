import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BetaBanner } from '@/components/beta-banner';

describe('BetaBanner', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('renders the beta message', () => {
    render(<BetaBanner />);

    expect(screen.getByRole('status')).toBeDefined();
    expect(screen.getByText(/Sifa is pre-alpha/)).toBeDefined();
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
