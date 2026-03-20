import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TangledCard } from '@/components/activity-cards/tangled-card';
import type { ActivityCardProps } from '@/components/activity-cards/types';

function makeProps(overrides: Partial<ActivityCardProps> = {}): ActivityCardProps {
  return {
    record: {
      name: 'sifa-api',
      description: 'AppView backend for Sifa professional identity',
      language: 'TypeScript',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    collection: 'sh.tangled.graph.repo',
    uri: 'at://did:plc:abc123/sh.tangled.graph.repo/rkey1',
    rkey: 'rkey1',
    authorDid: 'did:plc:abc123',
    authorHandle: 'alice.test',
    showAuthor: false,
    compact: false,
    ...overrides,
  };
}

describe('TangledCard', () => {
  it('renders repo name and description', () => {
    render(<TangledCard {...makeProps()} />);

    expect(screen.getByTestId('tangled-title').textContent).toBe('sifa-api');
    expect(screen.getByTestId('tangled-description').textContent).toBe(
      'AppView backend for Sifa professional identity',
    );
    expect(screen.getByTestId('tangled-card-full')).toBeDefined();
    expect(screen.getByText('Tangled')).toBeDefined();
    expect(screen.getByText('3h ago')).toBeDefined();
  });

  it('shows language badge when present', () => {
    render(<TangledCard {...makeProps()} />);

    const badge = screen.getByTestId('tangled-language-badge');
    expect(badge.textContent).toBe('TypeScript');
  });

  it('gracefully handles records without name or description', () => {
    render(
      <TangledCard
        {...makeProps({
          record: {
            createdAt: new Date().toISOString(),
          },
        })}
      />,
    );

    expect(screen.getByTestId('tangled-title').textContent).toBe('Activity on Tangled');
    expect(screen.queryByTestId('tangled-description')).toBeNull();
    expect(screen.queryByTestId('tangled-language-badge')).toBeNull();
  });

  it('falls back to text/title/message fields when name is absent', () => {
    render(
      <TangledCard
        {...makeProps({
          record: {
            message: 'fix: resolve auth token refresh',
            createdAt: new Date().toISOString(),
          },
          collection: 'sh.tangled.graph.commit',
        })}
      />,
    );

    expect(screen.getByTestId('tangled-title').textContent).toBe('fix: resolve auth token refresh');
  });

  it('compact variant shows single row', () => {
    render(<TangledCard {...makeProps({ compact: true })} />);

    const card = screen.getByTestId('tangled-card-compact');
    expect(card).toBeDefined();
    expect(screen.getByText('sifa-api')).toBeDefined();
    // Language badge still visible in compact
    expect(screen.getByTestId('tangled-language-badge').textContent).toBe('TypeScript');
    // Full-variant elements should not be present
    expect(screen.queryByTestId('tangled-card-full')).toBeNull();
    expect(screen.queryByText('Tangled')).toBeNull();
  });

  it('shows collection type label', () => {
    render(<TangledCard {...makeProps()} />);

    const label = screen.getByTestId('tangled-type-label');
    expect(label.textContent).toBe('Repository');
  });

  it('derives correct type labels from collection NSID', () => {
    const { unmount } = render(
      <TangledCard {...makeProps({ collection: 'sh.tangled.graph.commit' })} />,
    );
    expect(screen.getByTestId('tangled-type-label').textContent).toBe('Commit');
    unmount();

    render(<TangledCard {...makeProps({ collection: 'sh.tangled.graph.issue' })} />);
    expect(screen.getByTestId('tangled-type-label').textContent).toBe('Issue');
  });

  it('renders "View on Tangled" link when name and handle are available', () => {
    render(<TangledCard {...makeProps()} />);

    const link = screen.getByText('View on Tangled') as HTMLAnchorElement;
    expect(link.href).toBe('https://tangled.sh/alice.test/sifa-api');
    expect(link.target).toBe('_blank');
    expect(link.rel).toContain('noopener');
  });

  it('omits "View on Tangled" link when name is missing', () => {
    render(
      <TangledCard
        {...makeProps({
          record: { text: 'Some activity', createdAt: new Date().toISOString() },
        })}
      />,
    );

    expect(screen.queryByText('View on Tangled')).toBeNull();
  });

  it('uses emerald accent stripe color', () => {
    render(<TangledCard {...makeProps()} />);

    const card = screen.getByTestId('tangled-card-full');
    expect(card.style.borderLeftColor).toBe('rgb(5, 150, 105)');
  });
});
