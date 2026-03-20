import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ActivityOverview } from '@/components/activity-overview';
import type { ActivityTeaserResponse } from '@/lib/api';

vi.mock('@/components/activity-heatmap/activity-heatmap', () => ({
  ActivityHeatmap: () => null,
}));

vi.mock('react-activity-calendar', () => ({ default: () => null }));

vi.mock('@/lib/api', () => ({
  fetchActivityTeaser: vi.fn(),
}));

vi.mock('@/components/activity-cards/card-registry', () => ({
  getCardComponent: vi.fn(() => null),
}));

import { fetchActivityTeaser } from '@/lib/api';

const mockFetch = vi.mocked(fetchActivityTeaser);

const MOCK_ITEMS: ActivityTeaserResponse = {
  items: [
    {
      uri: 'at://did:plc:abc/app.bsky.feed.post/1',
      collection: 'app.bsky.feed.post',
      rkey: '1',
      record: { text: 'Hello world', createdAt: '2026-03-15T10:00:00Z' },
      appId: 'bluesky',
      appName: 'Bluesky',
      category: 'posts',
      indexedAt: '2026-03-15T10:00:00Z',
    },
    {
      uri: 'at://did:plc:abc/link.tangled.repo/2',
      collection: 'link.tangled.repo',
      rkey: '2',
      record: { name: 'my-repo', createdAt: '2026-03-14T08:00:00Z' },
      appId: 'tangled',
      appName: 'Tangled',
      category: 'code',
      indexedAt: '2026-03-14T08:00:00Z',
    },
    {
      uri: 'at://did:plc:abc/com.whtwnd.blog.entry/3',
      collection: 'com.whtwnd.blog.entry',
      rkey: '3',
      record: { title: 'My blog post', createdAt: '2026-03-13T12:00:00Z' },
      appId: 'whitewind',
      appName: 'WhiteWind',
      category: 'articles',
      indexedAt: '2026-03-13T12:00:00Z',
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ActivityOverview', () => {
  it('renders teaser cards when data is available', async () => {
    mockFetch.mockResolvedValue(MOCK_ITEMS);

    render(<ActivityOverview handle="alice.bsky.social" />);

    await waitFor(() => {
      expect(screen.getByTestId('activity-overview')).toBeDefined();
    });

    const cards = screen.getAllByTestId('activity-card-compact');
    expect(cards).toHaveLength(3);

    expect(screen.getByText('Hello world')).toBeDefined();
    expect(screen.getByText('my-repo')).toBeDefined();
    expect(screen.getByText('My blog post')).toBeDefined();
  });

  it('shows nothing when no items', async () => {
    mockFetch.mockResolvedValue({ items: [] });

    const { container } = render(<ActivityOverview handle="alice.bsky.social" />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // Give time for state to settle
    await new Promise((r) => setTimeout(r, 50));

    expect(container.innerHTML).toBe('');
  });

  it('shows nothing when fetch returns null', async () => {
    mockFetch.mockResolvedValue(null);

    const { container } = render(<ActivityOverview handle="alice.bsky.social" />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    await new Promise((r) => setTimeout(r, 50));

    expect(container.innerHTML).toBe('');
  });

  it('shows "View full activity" link', async () => {
    mockFetch.mockResolvedValue(MOCK_ITEMS);

    render(<ActivityOverview handle="alice.bsky.social" />);

    await waitFor(() => {
      expect(screen.getByTestId('activity-view-all')).toBeDefined();
    });

    const link = screen.getByTestId('activity-view-all');
    expect(link.getAttribute('href')).toBe('/p/alice.bsky.social/activity');
    expect(link.textContent).toContain('View full activity');
  });
});
