import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FollowButton } from '@/components/follow-button';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock auth provider -- default to authenticated
const mockUseAuth = vi.fn();
vi.mock('@/components/auth-provider', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock sonner
const mockToast = vi.fn();
vi.mock('sonner', () => ({
  toast: (...args: unknown[]) => mockToast(...args),
}));

describe('FollowButton', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockToast.mockReset();
    // Default: authenticated
    mockUseAuth.mockReturnValue({
      session: { did: 'did:plc:viewer' },
      isLoading: false,
      refresh: vi.fn(),
    });
  });

  it('renders "Follow" when not following', () => {
    render(<FollowButton targetDid="did:plc:abc123" isFollowing={false} />);
    expect(screen.getByRole('button', { name: 'Follow' })).toBeDefined();
  });

  it('renders "Unfollow" when following', () => {
    render(<FollowButton targetDid="did:plc:abc123" isFollowing={true} />);
    expect(screen.getByRole('button', { name: 'Unfollow' })).toBeDefined();
  });

  it('optimistically updates to "Unfollow" on click', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    const user = userEvent.setup();

    render(<FollowButton targetDid="did:plc:abc123" isFollowing={false} />);
    const button = screen.getByRole('button', { name: 'Follow' });

    await user.click(button);

    // Optimistic: should now show Unfollow
    expect(screen.getByRole('button', { name: 'Unfollow' })).toBeDefined();
  });

  it('calls POST /api/follow when following', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    const user = userEvent.setup();

    render(<FollowButton targetDid="did:plc:abc123" isFollowing={false} />);
    await user.click(screen.getByRole('button', { name: 'Follow' }));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/follow'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('calls DELETE /api/follow/:did when unfollowing', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    const user = userEvent.setup();

    render(<FollowButton targetDid="did:plc:abc123" isFollowing={true} />);
    await user.click(screen.getByRole('button', { name: 'Unfollow' }));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/follow/did%3Aplc%3Aabc123'),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('reverts on failed follow', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const user = userEvent.setup();

    render(<FollowButton targetDid="did:plc:abc123" isFollowing={false} />);
    await user.click(screen.getByRole('button', { name: 'Follow' }));

    // After the failed request settles, should revert to "Follow"
    // Wait for the transition to complete
    await vi.waitFor(() => {
      expect(screen.getByRole('button', { name: 'Follow' })).toBeDefined();
    });
  });

  it('shows a toast instead of calling the API when not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      session: null,
      isLoading: false,
      refresh: vi.fn(),
    });
    const user = userEvent.setup();

    render(<FollowButton targetDid="did:plc:abc123" isFollowing={false} />);
    await user.click(screen.getByRole('button', { name: 'Follow' }));

    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalled();
  });
});
