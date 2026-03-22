import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  resolvePathHref,
  markOnboardingSeen,
  hasSeenOnboarding,
  isEmailBannerDismissed,
  dismissEmailBanner,
} from '@/lib/onboarding';

// The test environment's localStorage is a minimal stub (only getItem/setItem exposed).
// Use a vi.fn()-based mock for localStorage so we can inspect and reset calls.
const mockLocalStorage = (() => {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((k) => delete store[k]);
    }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage });

describe('resolvePathHref', () => {
  it('resolves dynamic:profile to /p/{handle}', () => {
    expect(resolvePathHref('dynamic:profile', 'alice.bsky.social')).toBe('/p/alice.bsky.social');
  });

  it('returns static hrefs unchanged', () => {
    expect(resolvePathHref('/import', 'alice')).toBe('/import');
    expect(resolvePathHref('/', 'alice')).toBe('/');
  });

  it('resolves dynamic:profile with a DID as handle', () => {
    expect(resolvePathHref('dynamic:profile', 'did:plc:abc123')).toBe('/p/did:plc:abc123');
  });

  it('does not mutate a non-dynamic href even if it looks like a prefix', () => {
    expect(resolvePathHref('dynamic:other', 'alice')).toBe('dynamic:other');
  });
});

describe('markOnboardingSeen / hasSeenOnboarding', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('returns false before the flag is set', () => {
    expect(hasSeenOnboarding()).toBe(false);
  });

  it('returns true after markOnboardingSeen is called', () => {
    markOnboardingSeen();
    expect(hasSeenOnboarding()).toBe(true);
  });

  it('persists only within the session (sessionStorage key)', () => {
    markOnboardingSeen();
    expect(sessionStorage.getItem('sifa:onboarding-seen')).toBe('true');
  });
});

describe('isEmailBannerDismissed / dismissEmailBanner', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  it('returns false when localStorage has no entry', () => {
    expect(isEmailBannerDismissed()).toBe(false);
  });

  it('returns true after dismissEmailBanner is called', () => {
    dismissEmailBanner();
    expect(isEmailBannerDismissed()).toBe(true);
  });

  it('persists in localStorage under the correct key', () => {
    dismissEmailBanner();
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('sifa:welcome-email-dismissed', 'true');
  });
});
