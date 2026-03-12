import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// Must import after module setup — vitest hoists vi.stubGlobal
import {
  fetchSuggestions,
  fetchSuggestionCount,
  dismissSuggestion,
  undismissSuggestion,
  createInvite,
} from '@/lib/api';

describe('Suggestions API client', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('fetchSuggestions calls GET /api/suggestions with credentials', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ onSifa: [], notOnSifa: [], cursor: undefined }),
    });

    const result = await fetchSuggestions();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/suggestions'),
      expect.objectContaining({ credentials: 'include' }),
    );
    expect(result).toHaveProperty('onSifa');
    expect(result).toHaveProperty('notOnSifa');
  });

  it('fetchSuggestions passes source filter', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ onSifa: [], notOnSifa: [] }),
    });

    await fetchSuggestions({ source: 'bluesky' });
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('source=bluesky');
  });

  it('fetchSuggestionCount returns count number', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ count: 5 }),
    });

    const result = await fetchSuggestionCount();
    expect(result).toBe(5);
  });

  it('dismissSuggestion calls POST with subjectDid', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ status: 'ok' }) });

    await dismissSuggestion('did:plc:test');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/suggestions/dismiss'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ subjectDid: 'did:plc:test' }),
      }),
    );
  });

  it('undismissSuggestion calls DELETE', async () => {
    mockFetch.mockResolvedValue({ ok: true });

    await undismissSuggestion('did:plc:test');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/suggestions/dismiss/did%3Aplc%3Atest'),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('createInvite returns inviteUrl', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ inviteUrl: 'https://sifa.id/claim?ref=did:plc:test' }),
    });

    const result = await createInvite('did:plc:test');
    expect(result).toBe('https://sifa.id/claim?ref=did:plc:test');
  });
});
