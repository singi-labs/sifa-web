import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { detectConnections } from '../use-attendee-connections';

const BSKY_API = 'https://public.api.bsky.app/xrpc/app.bsky.graph.getRelationships';

function makeDid(n: number): string {
  return `did:plc:user${String(n).padStart(3, '0')}`;
}

function makeDids(count: number): string[] {
  return Array.from({ length: count }, (_, i) => makeDid(i + 1));
}

interface RelationshipEntry {
  did: string;
  following?: string;
  followedBy?: string;
}

function mockRelationshipsResponse(actor: string, relationships: RelationshipEntry[]) {
  return {
    ok: true,
    json: async () => ({
      actor,
      relationships,
    }),
  };
}

describe('detectConnections', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns empty map when userDid is null', async () => {
    const result = await detectConnections(null, makeDids(5));
    expect(result.size).toBe(0);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it('returns empty map when attendeeDids is empty', async () => {
    const result = await detectConnections('did:plc:me', []);
    expect(result.size).toBe(0);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it('batches requests correctly (65 DIDs -> 3 calls)', async () => {
    const dids = makeDids(65);
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue(mockRelationshipsResponse('did:plc:me', []) as unknown as Response);

    await detectConnections('did:plc:me', dids);

    expect(mockFetch).toHaveBeenCalledTimes(3);

    // First batch: 30 DIDs
    const firstCallUrl = new URL(mockFetch.mock.calls[0]![0] as string);
    const firstOthers = firstCallUrl.searchParams.getAll('others');
    expect(firstOthers).toHaveLength(30);

    // Second batch: 30 DIDs
    const secondCallUrl = new URL(mockFetch.mock.calls[1]![0] as string);
    const secondOthers = secondCallUrl.searchParams.getAll('others');
    expect(secondOthers).toHaveLength(30);

    // Third batch: 5 DIDs
    const thirdCallUrl = new URL(mockFetch.mock.calls[2]![0] as string);
    const thirdOthers = thirdCallUrl.searchParams.getAll('others');
    expect(thirdOthers).toHaveLength(5);
  });

  it('classifies mutual, following, and followedBy correctly', async () => {
    const mutualDid = 'did:plc:mutual';
    const followingDid = 'did:plc:following';
    const followedByDid = 'did:plc:followedby';
    const strangerDid = 'did:plc:stranger';

    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue(
      mockRelationshipsResponse('did:plc:me', [
        {
          did: mutualDid,
          following: 'at://did:plc:me/app.bsky.graph.follow/abc',
          followedBy: 'at://did:plc:mutual/app.bsky.graph.follow/def',
        },
        { did: followingDid, following: 'at://did:plc:me/app.bsky.graph.follow/ghi' },
        { did: followedByDid, followedBy: 'at://did:plc:followedby/app.bsky.graph.follow/jkl' },
        { did: strangerDid },
      ]) as unknown as Response,
    );

    const result = await detectConnections('did:plc:me', [
      mutualDid,
      followingDid,
      followedByDid,
      strangerDid,
    ]);

    expect(result.get(mutualDid)).toBe('mutual');
    expect(result.get(followingDid)).toBe('following');
    expect(result.get(followedByDid)).toBe('followedBy');
    expect(result.has(strangerDid)).toBe(false);
  });

  it('does not include strangers (no connection) in the map', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue(
      mockRelationshipsResponse('did:plc:me', [
        { did: 'did:plc:stranger1' },
        { did: 'did:plc:stranger2' },
      ]) as unknown as Response,
    );

    const result = await detectConnections('did:plc:me', [
      'did:plc:stranger1',
      'did:plc:stranger2',
    ]);

    expect(result.size).toBe(0);
  });

  it('handles API errors gracefully (returns partial results)', async () => {
    const dids = makeDids(45); // 2 batches: 30 + 15
    const mockFetch = vi.mocked(fetch);

    // First batch succeeds with one mutual
    mockFetch
      .mockResolvedValueOnce(
        mockRelationshipsResponse('did:plc:me', [
          { did: makeDid(1), following: 'at://x/y/z', followedBy: 'at://a/b/c' },
        ]) as unknown as Response,
      )
      // Second batch fails
      .mockRejectedValueOnce(new Error('Network error'));

    const result = await detectConnections('did:plc:me', dids);

    // Should still have results from the first batch
    expect(result.get(makeDid(1))).toBe('mutual');
    // Size should be 1 (only the successful result)
    expect(result.size).toBe(1);
  });

  it('passes AbortSignal to fetch calls', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue(mockRelationshipsResponse('did:plc:me', []) as unknown as Response);

    const controller = new AbortController();
    await detectConnections('did:plc:me', makeDids(5), controller.signal);

    const callOptions = mockFetch.mock.calls[0]![1] as RequestInit;
    expect(callOptions.signal).toBe(controller.signal);
  });

  it('constructs correct URL with actor and others params', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue(mockRelationshipsResponse('did:plc:me', []) as unknown as Response);

    await detectConnections('did:plc:me', ['did:plc:other1', 'did:plc:other2']);

    const callUrl = new URL(mockFetch.mock.calls[0]![0] as string);
    expect(callUrl.origin + callUrl.pathname).toBe(BSKY_API);
    expect(callUrl.searchParams.get('actor')).toBe('did:plc:me');
    expect(callUrl.searchParams.getAll('others')).toEqual(['did:plc:other1', 'did:plc:other2']);
  });
});
