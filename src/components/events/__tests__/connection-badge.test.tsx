import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ConnectionBadge } from '../connection-badge';

describe('ConnectionBadge', () => {
  it('renders "Mutual" with ArrowsLeftRight icon for mutual connections', () => {
    render(<ConnectionBadge type="mutual" handle="alice.bsky.social" />);

    expect(screen.getByText('Mutual')).toBeDefined();
    // Phosphor icons render as SVG elements
    const badge = screen.getByText('Mutual').closest('span');
    expect(badge?.querySelector('svg')).not.toBeNull();
  });

  it('renders "Following" with UserCheck icon for following connections', () => {
    render(<ConnectionBadge type="following" handle="bob.bsky.social" />);

    expect(screen.getByText('Following')).toBeDefined();
    const badge = screen.getByText('Following').closest('span');
    expect(badge?.querySelector('svg')).not.toBeNull();
  });

  it('renders "Follows you" with UserPlus icon for followedBy connections', () => {
    render(<ConnectionBadge type="followedBy" handle="carol.bsky.social" />);

    expect(screen.getByText('Follows you')).toBeDefined();
    const badge = screen.getByText('Follows you').closest('span');
    expect(badge?.querySelector('svg')).not.toBeNull();
  });

  it('returns null when type is undefined', () => {
    const { container } = render(<ConnectionBadge type={undefined} />);

    expect(container.innerHTML).toBe('');
  });

  it('has accessible aria-label including handle when provided', () => {
    render(<ConnectionBadge type="mutual" handle="alice.bsky.social" />);

    const badge = screen.getByLabelText('Mutual follow with alice.bsky.social');
    expect(badge).toBeDefined();
  });

  it('falls back to label-only aria-label when no handle provided', () => {
    render(<ConnectionBadge type="following" />);

    const badge = screen.getByLabelText('Following');
    expect(badge).toBeDefined();
  });

  it('has correct aria-label for followedBy without handle', () => {
    render(<ConnectionBadge type="followedBy" />);

    const badge = screen.getByLabelText('Follows you');
    expect(badge).toBeDefined();
  });

  it('has correct aria-label for followedBy with handle', () => {
    render(<ConnectionBadge type="followedBy" handle="dave.bsky.social" />);

    const badge = screen.getByLabelText('Followed by dave.bsky.social');
    expect(badge).toBeDefined();
  });
});
