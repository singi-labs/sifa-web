import { test, expect } from './fixtures/base';

/**
 * Visual regression tests using Playwright's built-in toHaveScreenshot.
 * On first run, screenshots are saved as baselines in the spec-snapshots dir.
 * On subsequent runs, screenshots are compared — >1% pixel diff fails the test.
 *
 * Baselines are platform-specific (darwin vs linux). Generate baselines with:
 *   pnpm test:e2e:update-snapshots
 *
 * In CI, baselines must exist for the Linux platform. If missing, the test
 * creates them (first run) and subsequent runs compare against them.
 */

const ALL_PAGES = [
  { path: '/', name: 'homepage' },
  { path: '/about', name: 'about' },
  { path: '/privacy', name: 'privacy' },
  { path: '/terms', name: 'terms' },
  { path: '/login', name: 'login' },
  { path: '/embed', name: 'embed' },
  { path: '/search', name: 'search' },
  { path: '/experts', name: 'experts' },
];

// AFFECTED_PAGES env var (comma-separated page names, e.g. "homepage,about")
// filters which pages get screenshotted. "all" or unset = screenshot everything.
const affected = process.env.AFFECTED_PAGES;
const PAGES =
  affected && affected !== 'all'
    ? ALL_PAGES.filter(({ name }) => affected.split(',').includes(name))
    : ALL_PAGES;

test.describe('Visual regression', () => {
  for (const { path, name } of PAGES) {
    test(`${name} matches baseline`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');

      // Wait for fonts and images to load
      await page.waitForLoadState('load');

      // Mask dynamic content that changes between runs
      const maskLocators = [
        page.locator('[data-testid="avatar"]'),
        page.locator('time'),
        page.locator('[data-testid="dynamic-count"]'),
      ];

      await expect(page).toHaveScreenshot(`${name}.png`, {
        fullPage: true,
        mask: maskLocators,
      });
    });
  }
});
