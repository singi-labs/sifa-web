import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SuggestionCard } from '@/components/suggestion-card';

describe('SuggestionCard', () => {
  const defaultProps = {
    did: 'did:plc:test',
    handle: 'alice.bsky.social',
    displayName: 'Alice Johnson',
    headline: 'Product Designer',
    source: 'bluesky',
    claimed: true,
    onDismiss: vi.fn(),
    onFollow: vi.fn(),
    onInvite: vi.fn(),
  };

  it('renders handle and display name', () => {
    render(<SuggestionCard {...defaultProps} />);
    expect(screen.getByText('Alice Johnson')).toBeDefined();
    expect(screen.getByText('alice.bsky.social')).toBeDefined();
  });

  it('shows Follow button for claimed profiles', () => {
    render(<SuggestionCard {...defaultProps} claimed={true} />);
    expect(screen.getByRole('button', { name: /follow/i })).toBeDefined();
  });

  it('shows Invite button for unclaimed profiles', () => {
    render(<SuggestionCard {...defaultProps} claimed={false} />);
    expect(screen.getByRole('button', { name: /invite/i })).toBeDefined();
  });

  it('shows source badge', () => {
    render(<SuggestionCard {...defaultProps} source="bluesky" />);
    expect(screen.getByText(/bluesky/i)).toBeDefined();
  });

  it('shows dismiss button', () => {
    render(<SuggestionCard {...defaultProps} />);
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeDefined();
  });
});
