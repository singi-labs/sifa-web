import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileEditProvider } from '@/components/profile-edit-provider';
import { IdentityCard } from '@/components/identity-card';
import type { Profile } from '@/lib/types';

// Mock clipboard API
Object.assign(navigator, { clipboard: { writeText: vi.fn(() => Promise.resolve()) } });

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock follow-button
vi.mock('@/components/follow-button', () => ({
  FollowButton: () => <button data-testid="follow-button">Follow</button>,
}));

// Mock auth-provider — return own DID so edit button appears
vi.mock('@/components/auth-provider', () => ({
  useAuth: () => ({ session: { did: 'did:plc:test' }, isLoading: false, refresh: vi.fn() }),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

// Mock sonner
vi.mock('sonner', () => {
  const fn = vi.fn() as ReturnType<typeof vi.fn> & { success: ReturnType<typeof vi.fn> };
  fn.success = vi.fn();
  return { toast: fn };
});

const baseProfile: Profile = {
  did: 'did:plc:test',
  handle: 'test.bsky.social',
  displayName: 'Test User',
  headline: 'Engineer',
  claimed: true,
  followersCount: 0,
  followingCount: 0,
  connectionsCount: 0,
  positions: [],
  education: [],
  skills: [],
  isOwnProfile: true,
};

/**
 * Regression test: clicking "Edit Profile" on the IdentityCard must not crash.
 *
 * The ProfileEditDialog uses useProfileEdit(), which requires a ProfileEditProvider
 * ancestor. When the provider only wraps ProfileBody (not IdentityCard), clicking
 * Edit throws "useProfileEdit must be used within a ProfileEditProvider" and the
 * route error boundary shows "Could not load profile".
 *
 * See: PR #270 (introduced the bug), this PR (fix)
 */
describe('Edit Profile button (integration)', () => {
  it('opens the edit dialog without throwing when IdentityCard is inside ProfileEditProvider', async () => {
    const user = userEvent.setup();

    render(
      <ProfileEditProvider initialProfile={baseProfile}>
        <IdentityCard
          did={baseProfile.did}
          handle={baseProfile.handle}
          displayName={baseProfile.displayName}
          headline={baseProfile.headline}
          claimed={baseProfile.claimed}
          isOwnProfile
        />
      </ProfileEditProvider>,
    );

    const editButton = screen.getByRole('button', { name: /edit profile/i });
    await user.click(editButton);

    // Dialog should be visible — not crashed
    expect(screen.getByRole('dialog')).toBeDefined();
  });
});
