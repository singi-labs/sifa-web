import { describe, it, expect } from 'vitest';
import { onboardingPaths } from '@/app/(main)/welcome/onboarding-paths';

describe('onboarding paths config', () => {
  it('has exactly 3 paths', () => {
    expect(onboardingPaths).toHaveLength(3);
  });

  it('has exactly 1 hero path', () => {
    const heroes = onboardingPaths.filter((p) => p.hero);
    expect(heroes).toHaveLength(1);
    expect(heroes[0]!.id).toBe('import');
  });

  it('all paths have required fields', () => {
    for (const path of onboardingPaths) {
      expect(path.id).toBeTruthy();
      expect(path.iconName).toBeTruthy();
      expect(path.href).toBeTruthy();
      expect(path.buttonVariant).toBeTruthy();
      expect(typeof path.order).toBe('number');
    }
  });

  it('has unique orders', () => {
    const orders = onboardingPaths.map((p) => p.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it('hero path has benefits array with at least one entry', () => {
    const hero = onboardingPaths.find((p) => p.hero);
    expect(hero?.benefits).toBeDefined();
    expect(hero?.benefits?.length).toBeGreaterThan(0);
  });

  it('non-hero paths do not have a benefits array', () => {
    const secondary = onboardingPaths.filter((p) => !p.hero);
    for (const path of secondary) {
      expect(path.benefits).toBeUndefined();
    }
  });

  it('paths are sorted by order when filtered and sorted', () => {
    const sorted = [...onboardingPaths].sort((a, b) => a.order - b.order);
    expect(sorted[0]!.order).toBeLessThan(sorted[1]!.order);
    expect(sorted[1]!.order).toBeLessThan(sorted[2]!.order);
  });

  it('each path has a valid iconName from the allowed set', () => {
    const allowed = new Set(['LinkedinLogo', 'PencilSimpleLine', 'Compass']);
    for (const path of onboardingPaths) {
      expect(allowed.has(path.iconName)).toBe(true);
    }
  });

  it('each path has a valid buttonVariant from the allowed set', () => {
    const allowed = new Set(['default', 'outline', 'ghost']);
    for (const path of onboardingPaths) {
      expect(allowed.has(path.buttonVariant)).toBe(true);
    }
  });

  it('hero path buttonVariant is "default"', () => {
    const hero = onboardingPaths.find((p) => p.hero);
    expect(hero?.buttonVariant).toBe('default');
  });

  it('hero path uses a static href (not dynamic:profile)', () => {
    const hero = onboardingPaths.find((p) => p.hero);
    expect(hero?.href).not.toBe('dynamic:profile');
  });

  it('manual path uses dynamic:profile href', () => {
    const manual = onboardingPaths.find((p) => p.id === 'manual');
    expect(manual?.href).toBe('dynamic:profile');
  });

  it('explore path points to find-people', () => {
    const explore = onboardingPaths.find((p) => p.id === 'explore');
    expect(explore?.href).toBe('/find-people');
  });
});
