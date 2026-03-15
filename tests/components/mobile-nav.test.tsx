import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileNav } from '@/components/mobile-nav';
import { AuthProvider } from '@/components/auth-provider';
import * as authLib from '@/lib/auth';

const mockGetSession = vi.mocked(authLib.getSession);

function renderMobileNav() {
  return render(
    <AuthProvider>
      <MobileNav />
    </AuthProvider>,
  );
}

describe('MobileNav', () => {
  beforeEach(() => {
    mockGetSession.mockReset();
  });

  it('renders a menu button', () => {
    mockGetSession.mockResolvedValue(null);
    renderMobileNav();

    const button = screen.getByRole('button', { name: 'Open menu' });
    expect(button).toBeDefined();
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens the menu on click', async () => {
    mockGetSession.mockResolvedValue(null);
    const user = userEvent.setup();
    renderMobileNav();

    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    expect(screen.getByRole('navigation')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Search' })).toBeDefined();
  });

  it('closes the menu on second click', async () => {
    mockGetSession.mockResolvedValue(null);
    const user = userEvent.setup();
    renderMobileNav();

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.getByRole('navigation')).toBeDefined();

    await user.click(screen.getByRole('button', { name: 'Close menu' }));
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('closes the menu when a link is clicked', async () => {
    mockGetSession.mockResolvedValue(null);
    const user = userEvent.setup();
    renderMobileNav();

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await user.click(screen.getByRole('link', { name: 'Search' }));

    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('shows sign in link when not authenticated', async () => {
    mockGetSession.mockResolvedValue(null);
    const user = userEvent.setup();
    renderMobileNav();

    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Sign in' })).toBeDefined();
    });
  });

  it('shows user info and actions when authenticated', async () => {
    mockGetSession.mockResolvedValue({
      did: 'did:plc:test',
      handle: 'alice.bsky.social',
      displayName: 'Alice',
    });
    const user = userEvent.setup();
    renderMobileNav();

    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeDefined();
      expect(screen.getByText('@alice.bsky.social')).toBeDefined();
    });
    expect(screen.getByRole('link', { name: /View profile/ })).toBeDefined();
    expect(screen.queryByRole('link', { name: /Edit profile/ })).toBeNull();
    expect(screen.getByRole('button', { name: /Sign out/ })).toBeDefined();
    expect(screen.queryByRole('link', { name: 'Sign in' })).toBeNull();
  });

  it('shows handle as display name when displayName is absent', async () => {
    mockGetSession.mockResolvedValue({
      did: 'did:plc:test',
      handle: 'bob.bsky.social',
    });
    const user = userEvent.setup();
    renderMobileNav();

    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    await waitFor(() => {
      expect(screen.getByText('bob.bsky.social')).toBeDefined();
    });
  });
});
