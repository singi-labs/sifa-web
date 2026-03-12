import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockFetchProfile = vi.fn();
const mockSanitize = vi.fn((input: string) => input);

vi.mock('@/lib/api', () => ({
  fetchProfile: (...args: unknown[]) => mockFetchProfile(...args),
}));

vi.mock('@/lib/sanitize', () => ({
  sanitize: (...args: unknown[]) => mockSanitize(...args),
}));

import { GET } from '@/app/api/embed/[handleOrDid]/data/route';

function buildRequest(handleOrDid: string): [NextRequest, { params: Promise<{ handleOrDid: string }> }] {
  const request = new NextRequest(`https://sifa.id/api/embed/${handleOrDid}/data`);
  const params = Promise.resolve({ handleOrDid });
  return [request, { params }];
}

const fullProfile = {
  did: 'did:plc:abc123',
  handle: 'alice.bsky.social',
  displayName: 'Alice Smith',
  avatar: 'https://cdn.example.com/alice.jpg',
  headline: 'Senior Engineer at Acme',
  locationCity: 'Amsterdam',
  locationRegion: 'North Holland',
  locationCountry: 'Netherlands',
  website: 'https://alice.dev',
  openTo: ['opportunities', 'mentoring'],
  trustStats: [{ label: 'endorsements', value: 5 }],
  verifiedAccounts: [
    { platform: 'github', identifier: 'alice', url: 'https://github.com/alice' },
  ],
  claimed: true,
};

describe('GET /api/embed/[handleOrDid]/data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSanitize.mockImplementation((input: string) => input);
  });

  it('returns card data for a valid profile', async () => {
    mockFetchProfile.mockResolvedValue(fullProfile);

    const [request, context] = buildRequest('alice.bsky.social');
    const response = await GET(request, context);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.did).toBe('did:plc:abc123');
    expect(body.handle).toBe('alice.bsky.social');
    expect(body.displayName).toBe('Alice Smith');
    expect(body.headline).toBe('Senior Engineer at Acme');
    expect(body.location).toBe('Amsterdam, North Holland, Netherlands');
    expect(body.profileUrl).toBe('https://sifa.id/p/alice.bsky.social');

    const cacheControl = response.headers.get('Cache-Control');
    expect(cacheControl).toContain('max-age=3600');

    const cors = response.headers.get('Access-Control-Allow-Origin');
    expect(cors).toBe('*');
  });

  it('returns 404 for unknown profile', async () => {
    mockFetchProfile.mockResolvedValue(null);

    const [request, context] = buildRequest('nobody.bsky.social');
    const response = await GET(request, context);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe('Profile not found');
  });

  it('sanitizes display name and headline', async () => {
    mockFetchProfile.mockResolvedValue({
      ...fullProfile,
      displayName: '<script>alert("xss")</script>',
      headline: '<img onerror="hack">',
    });

    const [request, context] = buildRequest('alice.bsky.social');
    await GET(request, context);

    expect(mockSanitize).toHaveBeenCalledWith('<script>alert("xss")</script>');
    expect(mockSanitize).toHaveBeenCalledWith('<img onerror="hack">');
  });

  it('handles missing optional fields gracefully', async () => {
    mockFetchProfile.mockResolvedValue({
      did: 'did:plc:minimal',
      handle: 'minimal.bsky.social',
      claimed: false,
    });

    const [request, context] = buildRequest('minimal.bsky.social');
    const response = await GET(request, context);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.avatar).toBeNull();
    expect(body.displayName).toBeNull();
    expect(body.headline).toBeNull();
    expect(body.location).toBeNull();
    expect(body.website).toBeNull();
    expect(body.openTo).toEqual([]);
    expect(body.trustStats).toEqual([]);
    expect(body.verifiedAccounts).toEqual([]);
  });
});
