import { describe, it, expect, vi, afterEach } from 'vitest';

// featureFlags is evaluated at module import time, so we use dynamic imports
// combined with vi.stubEnv / vi.unstubAllEnvs to control the env per test.

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('featureFlags', () => {
  it('welcomeEmail is false when env var is not set', async () => {
    vi.stubEnv('NEXT_PUBLIC_FF_WELCOME_EMAIL', '');
    const { featureFlags } = await import('@/lib/feature-flags');
    expect(featureFlags.welcomeEmail).toBe(false);
  });

  it('welcomeEmail is false when env var is "false"', async () => {
    vi.stubEnv('NEXT_PUBLIC_FF_WELCOME_EMAIL', 'false');
    const { featureFlags } = await import('@/lib/feature-flags');
    expect(featureFlags.welcomeEmail).toBe(false);
  });

  it('welcomeEmail is true when env var is "true"', async () => {
    vi.stubEnv('NEXT_PUBLIC_FF_WELCOME_EMAIL', 'true');
    const { featureFlags } = await import('@/lib/feature-flags');
    expect(featureFlags.welcomeEmail).toBe(true);
  });

  it('welcomeEmail is false for arbitrary truthy strings', async () => {
    vi.stubEnv('NEXT_PUBLIC_FF_WELCOME_EMAIL', '1');
    const { featureFlags } = await import('@/lib/feature-flags');
    expect(featureFlags.welcomeEmail).toBe(false);
  });
});
