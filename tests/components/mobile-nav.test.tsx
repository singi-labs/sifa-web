import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileNav } from '@/components/mobile-nav';

describe('MobileNav', () => {
  it('renders a menu button', () => {
    render(<MobileNav />);

    const button = screen.getByRole('button', { name: 'Open menu' });
    expect(button).toBeDefined();
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens the menu on click', async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    expect(screen.getByRole('navigation')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Search' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Import' })).toBeDefined();
  });

  it('closes the menu on second click', async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.getByRole('navigation')).toBeDefined();

    await user.click(screen.getByRole('button', { name: 'Close menu' }));
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('closes the menu when a link is clicked', async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await user.click(screen.getByRole('link', { name: 'Search' }));

    expect(screen.queryByRole('navigation')).toBeNull();
  });
});
