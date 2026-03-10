import { describe, it, expect } from 'vitest';
import { getPlatformInfo, PLATFORM_OPTIONS } from '@/lib/platforms';

describe('getPlatformInfo', () => {
  it('returns correct info for known platforms', () => {
    expect(getPlatformInfo('github').label).toBe('GitHub');
    expect(getPlatformInfo('fediverse').label).toBe('Fediverse');
    expect(getPlatformInfo('website').label).toBe('Website');
    expect(getPlatformInfo('rss').label).toBe('RSS');
  });

  it('returns fallback for unknown platforms', () => {
    const info = getPlatformInfo('unknown');
    expect(info.label).toBe('Link');
    expect(info.icon).toBeDefined();
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
    expect(values).toContain('other');
  });

  it('has labels for all options', () => {
    for (const opt of PLATFORM_OPTIONS) {
      expect(opt.label).toBeTruthy();
    }
  });
});
