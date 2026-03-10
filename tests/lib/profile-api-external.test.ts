import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createExternalAccount,
  updateExternalAccount,
  deleteExternalAccount,
} from '@/lib/profile-api';

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createExternalAccount', () => {
  it('sends POST with correct data', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ rkey: 'abc123', feedUrl: null }),
    });

    const result = await createExternalAccount({
      platform: 'github',
      url: 'https://github.com/testuser',
    });

    expect(result.success).toBe(true);
    expect(result.rkey).toBe('abc123');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/profile/external-accounts'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('returns error on failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Unauthorized' }),
    });

    const result = await createExternalAccount({
      platform: 'github',
      url: 'https://github.com/testuser',
    });

    expect(result.success).toBe(false);
  });
});

describe('updateExternalAccount', () => {
  it('sends PUT with rkey', async () => {
    mockFetch.mockResolvedValue({ ok: true });

    const result = await updateExternalAccount('abc123', {
      platform: 'website',
      url: 'https://example.com',
    });

    expect(result.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/profile/external-accounts/abc123'),
      expect.objectContaining({ method: 'PUT' }),
    );
  });
});

describe('deleteExternalAccount', () => {
  it('sends DELETE with rkey', async () => {
    mockFetch.mockResolvedValue({ ok: true });

    const result = await deleteExternalAccount('abc123');

    expect(result.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/profile/external-accounts/abc123'),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});
