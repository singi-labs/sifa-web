import { describe, expect, it } from 'vitest';
import {
  getHandleStem,
  getDisplayLabel,
  detectPdsProvider,
  pdsProviderFromApi,
} from '@/lib/pds-utils';

describe('getHandleStem', () => {
  it('strips .bsky.social suffix', () => {
    expect(getHandleStem('jennie-gander.bsky.social')).toBe('jennie-gander');
  });

  it('strips .blacksky.app suffix', () => {
    expect(getHandleStem('alice.blacksky.app')).toBe('alice');
  });

  it('strips .eurosky.social suffix', () => {
    expect(getHandleStem('bob.eurosky.social')).toBe('bob');
  });

  it('is case-insensitive when matching suffix', () => {
    expect(getHandleStem('Alice.Bsky.Social')).toBe('Alice');
  });

  it('returns full handle for custom domains', () => {
    expect(getHandleStem('jennie.example.com')).toBe('jennie.example.com');
  });

  it('returns full handle for unknown suffixes', () => {
    expect(getHandleStem('user.somehost.xyz')).toBe('user.somehost.xyz');
  });

  it('handles handle that is just the suffix (edge case)', () => {
    expect(getHandleStem('.bsky.social')).toBe('.bsky.social');
  });

  it('handles empty string', () => {
    expect(getHandleStem('')).toBe('');
  });
});

describe('getDisplayLabel', () => {
  it('returns displayName when provided', () => {
    expect(getDisplayLabel('Jennie Gander', 'jennie-gander.bsky.social')).toBe('Jennie Gander');
  });

  it('returns handle stem when displayName is undefined', () => {
    expect(getDisplayLabel(undefined, 'jennie-gander.bsky.social')).toBe('jennie-gander');
  });

  it('returns handle stem when displayName is empty string', () => {
    expect(getDisplayLabel('', 'jennie-gander.bsky.social')).toBe('jennie-gander');
  });

  it('returns full handle for custom domain when no displayName', () => {
    expect(getDisplayLabel(undefined, 'jennie.example.com')).toBe('jennie.example.com');
  });
});

describe('pdsProviderFromApi', () => {
  it('converts bluesky API provider to PdsProvider with profile URL', () => {
    const result = pdsProviderFromApi(
      { name: 'bluesky', host: 'morel.us-east.host.bsky.network' },
      'pfrazee.com',
    );
    expect(result).toEqual({
      name: 'bluesky',
      profileUrl: 'https://bsky.app/profile/pfrazee.com',
      host: 'morel.us-east.host.bsky.network',
    });
  });

  it('converts blacksky API provider to PdsProvider', () => {
    const result = pdsProviderFromApi(
      { name: 'blacksky', host: 'pds.blacksky.app' },
      'alice.blacksky.app',
    );
    expect(result).toEqual({
      name: 'blacksky',
      profileUrl: 'https://blacksky.app/profile/alice.blacksky.app',
      host: 'pds.blacksky.app',
    });
  });

  it('converts eurosky API provider to PdsProvider', () => {
    const result = pdsProviderFromApi(
      { name: 'eurosky', host: 'pds.eurosky.social' },
      'bob.eurosky.social',
    );
    expect(result).toEqual({
      name: 'eurosky',
      profileUrl: 'https://eurosky.tech/profile/bob.eurosky.social',
      host: 'pds.eurosky.social',
    });
  });

  it('returns null for null API provider', () => {
    expect(pdsProviderFromApi(null, 'user.bsky.social')).toBeNull();
  });

  it('returns null for undefined API provider', () => {
    expect(pdsProviderFromApi(undefined, 'user.bsky.social')).toBeNull();
  });

  it('returns icon-only provider for selfhosted', () => {
    const result = pdsProviderFromApi({ name: 'selfhosted', host: 'pds.alice.dev' }, 'alice.dev');
    expect(result).toEqual({ name: 'selfhosted', profileUrl: '', host: 'pds.alice.dev' });
  });

  it('returns icon-only provider for selfhosted-social', () => {
    const result = pdsProviderFromApi(
      { name: 'selfhosted-social', host: 'pds.selfhosted.social' },
      'user.selfhosted.social',
    );
    expect(result).toEqual({
      name: 'selfhosted-social',
      profileUrl: '',
      host: 'pds.selfhosted.social',
    });
  });

  it('returns null for truly unknown provider name', () => {
    expect(
      pdsProviderFromApi({ name: 'nonexistent-provider', host: 'pds.example.com' }, 'user.com'),
    ).toBeNull();
  });
});

describe('pdsProviderFromApi ?? detectPdsProvider fallback', () => {
  it('uses API provider when available (custom domain on known PDS)', () => {
    const apiResult = pdsProviderFromApi(
      { name: 'bluesky', host: 'morel.us-east.host.bsky.network' },
      'pfrazee.com',
    );
    const handleResult = detectPdsProvider('pfrazee.com');
    const result = apiResult ?? handleResult;
    expect(result).toEqual({
      name: 'bluesky',
      profileUrl: 'https://bsky.app/profile/pfrazee.com',
      host: 'morel.us-east.host.bsky.network',
    });
    expect(handleResult).toBeNull(); // handle detection would miss this
  });

  it('falls back to handle detection when API returns null', () => {
    const apiResult = pdsProviderFromApi(null, 'alice.bsky.social');
    const handleResult = detectPdsProvider('alice.bsky.social');
    const result = apiResult ?? handleResult;
    expect(result).toEqual({
      name: 'bluesky',
      profileUrl: 'https://bsky.app/profile/alice.bsky.social',
    });
  });

  it('returns null when both API and handle detection fail', () => {
    const apiResult = pdsProviderFromApi(null, 'user.selfhosted.dev');
    const handleResult = detectPdsProvider('user.selfhosted.dev');
    const result = apiResult ?? handleResult;
    expect(result).toBeNull();
  });
});
