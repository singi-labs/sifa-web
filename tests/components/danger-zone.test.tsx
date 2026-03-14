import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock profile-api
const mockResetProfile = vi.fn();
const mockDeleteAccount = vi.fn();
vi.mock('@/lib/profile-api', () => ({
  resetProfile: (...args: unknown[]) => mockResetProfile(...args),
  deleteAccount: (...args: unknown[]) => mockDeleteAccount(...args),
}));

// Mock sonner
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock('sonner', () => ({
  toast: Object.assign((...args: unknown[]) => args, {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  }),
}));

// Mock next/navigation with capturable push
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock next-intl with dangerZone translations
const dangerZoneTranslations: Record<string, string> = {
  title: 'Danger Zone',
  resetTitle: 'Reset Profile',
  resetDescription:
    'Remove all your Sifa profile data and start fresh. Your positions, education, skills, and all other profile sections will be deleted from both Sifa and your Personal Data Server. Your AT Protocol account, Bluesky profile, posts, follows, and data from other apps are not affected.',
  deleteTitle: 'Delete Account',
  deleteDescription:
    'Remove all your Sifa profile data and sign out. This is the same as resetting your profile, but also ends your session.',
  handleConfirmLabel: 'Type your handle to confirm',
  handlePlaceholder: 'your.handle',
  resetButton: 'Reset Profile',
  deleteButton: 'Delete Account',
  resetSuccess: 'Profile reset complete.',
  error: 'Something went wrong. Please try again.',
};

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => dangerZoneTranslations[key] ?? key,
}));

import { DangerZone } from '@/components/danger-zone';

describe('DangerZone', () => {
  beforeEach(() => {
    mockResetProfile.mockReset();
    mockDeleteAccount.mockReset();
    mockToastSuccess.mockReset();
    mockToastError.mockReset();
    mockPush.mockReset();
  });

  it('renders reset and delete sections', () => {
    render(<DangerZone handle="alice.bsky.social" />);

    expect(screen.getByText('Danger Zone')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Reset Profile' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Delete Account' })).toBeDefined();
  });

  it('reset button is disabled when handle does not match', () => {
    render(<DangerZone handle="alice.bsky.social" />);

    const resetButton = screen.getByRole('button', { name: 'Reset Profile' });
    expect(resetButton.hasAttribute('disabled')).toBe(true);
  });

  it('reset button is enabled when handle matches (case-insensitive)', async () => {
    const user = userEvent.setup();
    render(<DangerZone handle="alice.bsky.social" />);

    const inputs = screen.getAllByPlaceholderText('your.handle');
    // First input is for reset
    await user.type(inputs[0]!, 'ALICE.BSky.Social');

    const resetButton = screen.getByRole('button', { name: 'Reset Profile' });
    expect(resetButton.hasAttribute('disabled')).toBe(false);
  });

  it('calls resetProfile and redirects to /import on success', async () => {
    mockResetProfile.mockResolvedValueOnce({ success: true });
    const user = userEvent.setup();

    render(<DangerZone handle="alice.bsky.social" />);

    const inputs = screen.getAllByPlaceholderText('your.handle');
    await user.type(inputs[0]!, 'alice.bsky.social');
    await user.click(screen.getByRole('button', { name: 'Reset Profile' }));

    expect(mockResetProfile).toHaveBeenCalled();
    await vi.waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Profile reset complete.');
      expect(mockPush).toHaveBeenCalledWith('/import');
    });
  });

  it('calls deleteAccount and redirects with ?deleted=1 on success', async () => {
    mockDeleteAccount.mockResolvedValueOnce({ success: true });
    const user = userEvent.setup();

    render(<DangerZone handle="alice.bsky.social" />);

    const inputs = screen.getAllByPlaceholderText('your.handle');
    // Second input is for delete
    await user.type(inputs[1]!, 'alice.bsky.social');
    await user.click(screen.getByRole('button', { name: 'Delete Account' }));

    expect(mockDeleteAccount).toHaveBeenCalled();
    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/p/alice.bsky.social?deleted=1');
    });
  });

  it('shows error toast on resetProfile failure', async () => {
    mockResetProfile.mockResolvedValueOnce({ success: false, error: 'fail' });
    const user = userEvent.setup();

    render(<DangerZone handle="alice.bsky.social" />);

    const inputs = screen.getAllByPlaceholderText('your.handle');
    await user.type(inputs[0]!, 'alice.bsky.social');
    await user.click(screen.getByRole('button', { name: 'Reset Profile' }));

    await vi.waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Something went wrong. Please try again.');
    });
  });

  it('shows error toast on deleteAccount failure', async () => {
    mockDeleteAccount.mockResolvedValueOnce({ success: false, error: 'fail' });
    const user = userEvent.setup();

    render(<DangerZone handle="alice.bsky.social" />);

    const inputs = screen.getAllByPlaceholderText('your.handle');
    await user.type(inputs[1]!, 'alice.bsky.social');
    await user.click(screen.getByRole('button', { name: 'Delete Account' }));

    await vi.waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Something went wrong. Please try again.');
    });
  });
});
