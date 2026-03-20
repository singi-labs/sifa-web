import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BlueskyPostCard } from '@/components/activity-cards/bluesky-post-card';
import type { ActivityCardProps } from '@/components/activity-cards/types';

function makeProps(overrides: Partial<ActivityCardProps> = {}): ActivityCardProps {
  return {
    record: {
      text: 'Hello from Bluesky!',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    collection: 'app.bsky.feed.post',
    uri: 'at://did:plc:abc123/app.bsky.feed.post/rkey1',
    rkey: 'rkey1',
    authorDid: 'did:plc:abc123',
    authorHandle: 'alice.bsky.social',
    showAuthor: false,
    compact: false,
    ...overrides,
  };
}

describe('BlueskyPostCard', () => {
  it('renders post text', () => {
    render(<BlueskyPostCard {...makeProps()} />);

    expect(screen.getByText('Hello from Bluesky!')).toBeDefined();
    expect(screen.getByTestId('bluesky-card-full')).toBeDefined();
  });

  it('renders link facets as clickable links', () => {
    const text = 'Check out https://example.com for more';
    const facets = [
      {
        index: { byteStart: 10, byteEnd: 29 },
        features: [{ $type: 'app.bsky.richtext.facet#link', uri: 'https://example.com' }],
      },
    ];

    render(
      <BlueskyPostCard
        {...makeProps({ record: { text, facets, createdAt: new Date().toISOString() } })}
      />,
    );

    const link = screen.getByRole('link', { name: 'https://example.com' });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('https://example.com');
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('renders "View on Bluesky" link with correct URL', () => {
    render(<BlueskyPostCard {...makeProps()} />);

    const link = screen.getByRole('link', { name: 'View on Bluesky' });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('https://bsky.app/profile/alice.bsky.social/post/rkey1');
  });

  it('compact variant shows truncated text', () => {
    const longText =
      'This is a very long Bluesky post that exceeds one hundred characters and should be truncated when rendered in the compact card variant display mode.';

    render(
      <BlueskyPostCard
        {...makeProps({
          compact: true,
          record: { text: longText, createdAt: new Date().toISOString() },
        })}
      />,
    );

    const card = screen.getByTestId('bluesky-card-compact');
    expect(card).toBeDefined();
    // Text should be truncated at ~100 chars + "..."
    expect(card.textContent).toContain('...');
    expect(card.textContent).not.toContain('display mode.');
  });

  it('shows "Reply" label when record has reply field', () => {
    render(
      <BlueskyPostCard
        {...makeProps({
          record: {
            text: 'This is a reply',
            createdAt: new Date().toISOString(),
            reply: {
              root: { uri: 'at://did:plc:abc/app.bsky.feed.post/root1' },
              parent: { uri: 'at://did:plc:abc/app.bsky.feed.post/parent1' },
            },
          },
        })}
      />,
    );

    expect(screen.getByTestId('bluesky-reply-label')).toBeDefined();
    expect(screen.getByText('Reply')).toBeDefined();
  });

  it('renders mention facets as bold text', () => {
    const text = 'Hey @bob.bsky.social check this';
    const facets = [
      {
        index: { byteStart: 4, byteEnd: 20 },
        features: [{ $type: 'app.bsky.richtext.facet#mention', did: 'did:plc:bob123' }],
      },
    ];

    render(
      <BlueskyPostCard
        {...makeProps({ record: { text, facets, createdAt: new Date().toISOString() } })}
      />,
    );

    const mention = screen.getByText('@bob.bsky.social');
    expect(mention.tagName).toBe('SPAN');
    expect(mention.className).toContain('font-semibold');
  });

  it('does not show Reply label for non-reply posts', () => {
    render(<BlueskyPostCard {...makeProps()} />);

    expect(screen.queryByTestId('bluesky-reply-label')).toBeNull();
  });

  it('shows Bluesky app badge in full variant', () => {
    render(<BlueskyPostCard {...makeProps()} />);

    expect(screen.getByText('Bluesky')).toBeDefined();
  });
});
