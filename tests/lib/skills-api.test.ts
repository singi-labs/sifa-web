import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchSkills } from '@/lib/profile-api';

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('searchSkills', () => {
  it('calls the skills search endpoint with query and limit', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          { canonicalName: 'TypeScript', slug: 'typescript', category: 'Technical' },
        ]),
    });

    const results = await searchSkills('Type', 5);
    expect(results).toHaveLength(1);
    expect(results[0]?.canonicalName).toBe('TypeScript');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/skills/search?q=Type&limit=5'),
    );
  });

  it('uses default limit of 10', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await searchSkills('React');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/skills/search?q=React&limit=10'),
    );
  });

  it('returns empty array on API error', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    const results = await searchSkills('Test');
    expect(results).toEqual([]);
  });

  it('returns empty array on network failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'));

    const results = await searchSkills('Test');
    expect(results).toEqual([]);
  });

  it('encodes special characters in query', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await searchSkills('C++ & C#');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/skills/search?q=C%2B%2B%20%26%20C%23&limit=10'),
    );
  });
});
