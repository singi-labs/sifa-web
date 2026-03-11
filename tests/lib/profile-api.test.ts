import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { updateProfileSelf, createRecord, updateRecord, deleteRecord } from '@/lib/profile-api';

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('profile-api', () => {
  it('updateProfileSelf sends PUT with data', async () => {
    mockFetch.mockResolvedValue({ ok: true });
    const result = await updateProfileSelf({ headline: 'Developer' });
    expect(result.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/profile/self'),
      expect.objectContaining({ method: 'PUT' }),
    );
  });

  it('createRecord sends POST and returns rkey', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ rkey: 'tid123' }),
    });
    const result = await createRecord('id.sifa.profile.position', { title: 'Eng' });
    expect(result.success).toBe(true);
    expect(result.rkey).toBe('tid123');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/profile/records/id.sifa.profile.position'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('updateRecord sends PUT with rkey', async () => {
    mockFetch.mockResolvedValue({ ok: true });
    const result = await updateRecord('id.sifa.profile.position', 'abc123', {
      title: 'Senior Eng',
    });
    expect(result.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/profile/records/id.sifa.profile.position/abc123'),
      expect.objectContaining({ method: 'PUT' }),
    );
  });

  it('deleteRecord sends DELETE', async () => {
    mockFetch.mockResolvedValue({ ok: true });
    const result = await deleteRecord('id.sifa.profile.position', 'abc123');
    expect(result.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/profile/records/id.sifa.profile.position/abc123'),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('returns error on failed request', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Unauthorized' }),
    });
    const result = await updateProfileSelf({ headline: 'Test' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized');
  });

  it('handles network errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'));
    const result = await updateProfileSelf({ headline: 'Test' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Network error');
  });
});
