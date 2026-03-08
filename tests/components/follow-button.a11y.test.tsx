import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { FollowButton } from '@/components/follow-button';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('FollowButton accessibility', () => {
  it('should have no accessibility violations when not following', async () => {
    const { container } = render(<FollowButton targetDid="did:plc:abc123" isFollowing={false} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations when following', async () => {
    const { container } = render(<FollowButton targetDid="did:plc:abc123" isFollowing={true} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
