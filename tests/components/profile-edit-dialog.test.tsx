import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileEditDialog } from '@/components/profile-edit-dialog';
import { ProfileEditProvider } from '@/components/profile-edit-provider';
import type { Profile } from '@/lib/types';

const baseProfile: Profile = {
  did: 'did:plc:test',
  handle: 'test.bsky.social',
  claimed: true,
  followersCount: 0,
  followingCount: 0,
  connectionsCount: 0,
  positions: [],
  education: [],
  skills: [],
};

function renderWithProvider(ui: React.ReactElement, profile: Partial<Profile> = {}) {
  return render(
    <ProfileEditProvider initialProfile={{ ...baseProfile, ...profile }}>{ui}</ProfileEditProvider>,
  );
}

/**
 * Regression test: @base-ui/react v1.2.0 requires Popover.Positioner to be
 * wrapped in Popover.Portal. Without it, rendering throws:
 *   "Error: Base UI: <Popover.Portal> is missing."
 *
 * This error crashes the entire profile page via the route error boundary,
 * showing "Could not load profile" when clicking Edit Profile.
 *
 * See: PR #139 (original fix), PR #144 (accidental revert)
 */
describe('ProfileEditDialog', () => {
  it('renders without Popover.Portal error', () => {
    expect(() => {
      renderWithProvider(
        <ProfileEditDialog
          handle="test.bsky.social"
          displayName="Test User"
          avatar={undefined}
          headline="Test headline"
          about="Test about"
          location={null}
          openTo={[]}
          onClose={vi.fn()}
        />,
      );
    }).not.toThrow();
  });

  it('renders the dialog with correct role', () => {
    const { container } = renderWithProvider(
      <ProfileEditDialog
        handle="test.bsky.social"
        displayName="Test User"
        headline="Test headline"
        about="Test about"
        location={null}
        openTo={[]}
        onClose={vi.fn()}
      />,
    );
    // The dialog is rendered as a fixed overlay, not via Portal,
    // so query the container directly
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
  });

  it('renders the preferredWorkplace fieldset', () => {
    renderWithProvider(
      <ProfileEditDialog
        handle="test.bsky.social"
        displayName="Test User"
        location={null}
        openTo={[]}
        preferredWorkplace={[]}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole('group', { name: /preferredWorkplace/i })).toBeDefined();
  });

  it('renders on-site, remote, and hybrid options', () => {
    renderWithProvider(
      <ProfileEditDialog
        handle="test.bsky.social"
        displayName="Test User"
        location={null}
        openTo={[]}
        preferredWorkplace={[]}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole('checkbox', { name: /on.?site/i })).toBeDefined();
    expect(screen.getByRole('checkbox', { name: /remote/i })).toBeDefined();
    expect(screen.getByRole('checkbox', { name: /hybrid/i })).toBeDefined();
  });

  it('pre-checks options matching initial preferredWorkplace', () => {
    renderWithProvider(
      <ProfileEditDialog
        handle="test.bsky.social"
        displayName="Test User"
        location={null}
        openTo={[]}
        preferredWorkplace={['id.sifa.defs#remote', 'id.sifa.defs#hybrid']}
        onClose={vi.fn()}
      />,
    );
    expect((screen.getByRole('checkbox', { name: /on.?site/i }) as HTMLInputElement).checked).toBe(
      false,
    );
    expect((screen.getByRole('checkbox', { name: /remote/i }) as HTMLInputElement).checked).toBe(
      true,
    );
    expect((screen.getByRole('checkbox', { name: /hybrid/i }) as HTMLInputElement).checked).toBe(
      true,
    );
  });
});
