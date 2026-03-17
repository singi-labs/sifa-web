import { describe, it, expect } from 'vitest';
import { resolveDisplayFollowers } from '@/lib/follower-utils';

describe('resolveDisplayFollowers', () => {
  it('prefers atprotoFollowersCount when positive', () => {
    expect(resolveDisplayFollowers(5000, 10)).toEqual({ count: 5000, source: 'atproto' });
  });

  it('falls back to followersCount when atproto is zero', () => {
    expect(resolveDisplayFollowers(0, 42)).toEqual({ count: 42, source: 'sifa' });
  });

  it('falls back to followersCount when atproto is null', () => {
    expect(resolveDisplayFollowers(null, 42)).toEqual({ count: 42, source: 'sifa' });
  });

  it('falls back to followersCount when atproto is undefined', () => {
    expect(resolveDisplayFollowers(undefined, 42)).toEqual({ count: 42, source: 'sifa' });
  });

  it('returns undefined when both are zero', () => {
    expect(resolveDisplayFollowers(0, 0)).toBeUndefined();
  });

  it('returns undefined when both are absent', () => {
    expect(resolveDisplayFollowers(undefined, undefined)).toBeUndefined();
  });
});
