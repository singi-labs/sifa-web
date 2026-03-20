import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GenericActivityCard } from '@/components/activity-cards/generic-activity-card';
import type { ActivityCardProps } from '@/components/activity-cards/types';

function makeProps(overrides: Partial<ActivityCardProps> = {}): ActivityCardProps {
  return {
    record: {
      text: 'Hello world',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    collection: 'app.bsky.feed.post',
    uri: 'at://did:plc:abc123/app.bsky.feed.post/rkey1',
    rkey: 'rkey1',
    authorDid: 'did:plc:abc123',
    showAuthor: false,
    compact: false,
    ...overrides,
  };
}

describe('GenericActivityCard', () => {
  it('renders app name, content text, and timestamp in full variant', () => {
    render(<GenericActivityCard {...makeProps()} />);

    expect(screen.getByText('Hello world')).toBeDefined();
    expect(screen.getByText('Bluesky')).toBeDefined();
    expect(screen.getByText('2h ago')).toBeDefined();
    expect(screen.getByTestId('activity-card-full')).toBeDefined();
  });

  it('renders compact variant as single row with truncated text', () => {
    render(<GenericActivityCard {...makeProps({ compact: true })} />);

    const card = screen.getByTestId('activity-card-compact');
    expect(card).toBeDefined();
    expect(screen.getByText('Hello world')).toBeDefined();
    // Compact should not show app badge pill
    expect(screen.queryByText('Bluesky')).toBeNull();
  });

  it('falls back to "Activity on [App]" when no text field found in record', () => {
    render(
      <GenericActivityCard {...makeProps({ record: { createdAt: new Date().toISOString() } })} />,
    );

    expect(screen.getByText('Activity on Bluesky')).toBeDefined();
  });

  it('shows author when showAuthor is true', () => {
    render(
      <GenericActivityCard
        {...makeProps({
          showAuthor: true,
          authorHandle: 'alice.bsky.social',
          authorAvatar: 'https://example.com/avatar.jpg',
        })}
      />,
    );

    expect(screen.getByText('@alice.bsky.social')).toBeDefined();
    const img = screen.getByAltText("alice.bsky.social's avatar") as HTMLImageElement;
    expect(img.src).toBe('https://example.com/avatar.jpg');
  });

  it('hides author when showAuthor is false', () => {
    render(
      <GenericActivityCard
        {...makeProps({
          showAuthor: false,
          authorHandle: 'alice.bsky.social',
          authorAvatar: 'https://example.com/avatar.jpg',
        })}
      />,
    );

    expect(screen.queryByText('@alice.bsky.social')).toBeNull();
  });

  it('renders accent stripe with app color', () => {
    render(<GenericActivityCard {...makeProps()} />);

    const card = screen.getByTestId('activity-card-full');
    expect(card.style.borderLeftColor).toBe(
      'var(--app-bluesky-stripe, var(--app-fallback-stripe))',
    );
  });

  it('uses default stripe color for unknown apps', () => {
    render(<GenericActivityCard {...makeProps({ collection: 'com.unknown.thing' })} />);

    const card = screen.getByTestId('activity-card-full');
    expect(card.style.borderLeftColor).toBe(
      'var(--app-com.unknown-stripe, var(--app-fallback-stripe))',
    );
  });

  it('extracts title field when text is absent', () => {
    render(<GenericActivityCard {...makeProps({ record: { title: 'My Article' } })} />);

    expect(screen.getByText('My Article')).toBeDefined();
  });

  it('shows author handle without avatar in compact mode', () => {
    render(
      <GenericActivityCard
        {...makeProps({
          compact: true,
          showAuthor: true,
          authorHandle: 'bob.test',
        })}
      />,
    );

    expect(screen.getByText('@bob.test')).toBeDefined();
  });
});
