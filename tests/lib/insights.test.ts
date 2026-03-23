import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { EventInsightsData } from '@/lib/insights';

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

function makeFakeInsights(): EventInsightsData {
  return {
    slug: 'test-event',
    generatedAt: '2026-03-23T12:00:00Z',
    attendeeCount: 42,
    pdsDistribution: [{ host: 'bsky.social', count: 30, isSelfHosted: false }],
    didMethodSplit: [{ method: 'plc', count: 40 }],
    accountAgeDistribution: [{ label: '< 1 month', count: 5 }],
    ecosystemRoles: [{ role: 'poster', count: 20 }],
    connectionGraph: {
      nodes: [{ did: 'did:plc:abc', handle: 'alice.bsky.social', displayName: 'Alice', avatar: null, degree: 3 }],
      edges: [{ source: 'did:plc:abc', target: 'did:plc:def', mutual: true }],
    },
    postTimeline: [{ timestamp: '2026-03-22T00:00:00Z', posts: 10, replies: 5, reposts: 2 }],
    clientDiversity: [{ client: 'Bluesky', count: 35 }],
    summary: { attendeesTracked: 42, pdsProviderCount: 3, totalPosts: 100, connectedPercentage: 68 },
  };
}

describe('fetchEventInsights', () => {
  it('returns parsed data on successful response', async () => {
    const fakeData = makeFakeInsights();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(fakeData),
    });

    const { fetchEventInsights } = await import('@/lib/insights');
    const result = await fetchEventInsights('test-event');

    expect(result).toEqual(fakeData);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/events/test-event/insights'),
      expect.objectContaining({ next: { revalidate: 3600, tags: ['event-insights-test-event'] } }),
    );
  });

  it('returns null on 404 response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 });

    const { fetchEventInsights } = await import('@/lib/insights');
    const result = await fetchEventInsights('nonexistent');

    expect(result).toBeNull();
  });

  it('returns null on network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { fetchEventInsights } = await import('@/lib/insights');
    const result = await fetchEventInsights('test-event');

    expect(result).toBeNull();
  });
});
