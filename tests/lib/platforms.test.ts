import { describe, it, expect } from 'vitest';
import { getPlatformInfo, PLATFORM_OPTIONS, getFaviconUrl } from '@/lib/platforms';

describe('getPlatformInfo', () => {
  it('returns correct info for known platforms', () => {
    expect(getPlatformInfo('github').label).toBe('GitHub');
    expect(getPlatformInfo('fediverse').label).toBe('Fediverse');
    expect(getPlatformInfo('website').label).toBe('Website');
    expect(getPlatformInfo('rss').label).toBe('RSS');
  });

  it('returns website fallback for unknown platforms', () => {
    const info = getPlatformInfo('unknown');
    expect(info.label).toBe('Website');
    expect(info.icon).toBeDefined();
  });

  it('maps legacy "other" platform to website', () => {
    const info = getPlatformInfo('other');
    expect(info.label).toBe('Website');
  });
});

describe('PLATFORM_OPTIONS', () => {
  it('contains all expected platforms', () => {
    const values = PLATFORM_OPTIONS.map((o) => o.value);
    expect(values).toContain('github');
    expect(values).toContain('fediverse');
    expect(values).toContain('twitter');
    expect(values).toContain('website');
    expect(values).toContain('rss');
  });

  it('does not contain legacy "other" option', () => {
    const values = PLATFORM_OPTIONS.map((o) => o.value);
    expect(values).not.toContain('other');
  });

  it('has labels for all options', () => {
    for (const opt of PLATFORM_OPTIONS) {
      expect(opt.label).toBeTruthy();
    }
  });
});

describe('getFaviconUrl', () => {
  it('returns a Google favicon URL for valid URLs', () => {
    const result = getFaviconUrl('https://example.com/page');
    expect(result).toBe('https://www.google.com/s2/favicons?domain=example.com&sz=32');
  });

  it('returns null for invalid URLs', () => {
    expect(getFaviconUrl('not-a-url')).toBeNull();
  });
});
